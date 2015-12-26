class OfferController < ApplicationController

    include SessionsHelper
    
    before_filter :require_auth

    # PUT /offers
    # See outlines/offer_api.txt
    def create
        offer = Offer.where(user_id: @current_user.id, product_id: params[:product_id]).first
        if offer
            render status: 471, json: {error: true}
        end
        product = Product.find(params[:product_id])
        if product
            if product.user.id != @current_user.id
                if product.sold_status != Product.SOLD_SOLD
                    offer = Offer.new
                    offer.user = @current_user
                    offer.price = params[:price]
                    offer.offer_status = Offer.OFFER_OFFERED
                    offer.product = product
                    if offer.save()
                        payload = {
                            error: false,
                            id: offer.id
                        }
                        render status: 200, json: payload
                    else
                        errors = []
                        offer.errors.keys.each do |key|
                            errors << {field: key, message: offer.errors.full_messages_for(key).first}
                        end
                        payload = {
                            error: true,
                            errors: errors
                        }
                        render status: 200, json: payload
                    end
                else
                    render status: 473, json: {error: true}
                end
            else
                render status: 472, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end
    
    # Get /offers
    # See outlines/offer_api.txt
    def list
        offers = []
        if params[:product_id]
            product = Product.find(params[:product_id])
            if product
                if product.user.id == @current_user.id && params[:include_offers_made_by_other_users]
                    product.offers.each do |offer|
                        offers << {
                            offer_id: offer.id,
                            product: {
                                product_id: product.id,
                                product_name: product.product_name,
                                product_price: product.price
                            },
                            product_name: product.product_name,
                            user: {
                                user_id: offer.user.user_id,
                                first_name: offer.user.first_name,
                                last_name: offer.user.last_name
                            },
                            price: offer.price
                        }
                    end
                elsif product.user.id != @current_user.id && params[:include_offers_made_by_current_user]
                    offer = Offer.find_by(product_id: product.id, user_id: @current_user.id)
                    if offer
                        offers << {
                            offer_id: offer.id,
                            product: {
                                product_id: product.id,
                                product_name: product.product_name,
                                product_price: product.price
                            },
                            product_name: product.product_name,
                            user: {
                                first_name: offer.user.first_name,
                                last_name: offer.user.last_name
                            },
                            price: offer.price
                        }
                    end
                end
            else
                render status: 404, json: {error: true}
            end
        else
            if params[:include_offers_made_by_current_user]
                @current_user.offers.each do |offer|
                    offers << {
                        offer_id: offer.id,
                        product: {
                            product_id: offer.product.id,
                            product_name: offer.product.product_name,
                            product_price: offer.product.price
                        },
                        product_name: offer.product.product_name,
                        user: {
                            first_name: offer.user.first_name,
                            last_name: offer.user.last_name
                        },
                        price: offer.price
                    }
                end
            end
            if params[:include_offers_made_by_other_users]
                @current_user.products.each do |product|
                    product.offers.each do |offer|
                        offers << {
                            offer_id: offer.id,
                            product: {
                                product_id: product.id,
                                product_name: product.product_name,
                                product_price: product.price
                            },
                            product_name: product.product_name,
                            user: {
                                first_name: offer.user.first_name,
                                last_name: offer.user.last_name
                            },
                            price: offer.price
                        }
                    end
                end
            end
        end
        render status: 200, json: {offers: offers}
    end
    
    # GET /offers/:id
    # See outlines/offer_api.txt
    def read
        offer = Offer.find(params[:id])
        if offer
            if @current_user.id == offer.user.id || @current_user.id == offer.product.user.id
                render status: 200, json: {
                    offer_id: offer.id,
                    product: {
                        product_id: offer.product.id,
                        product_name: offer.product.product_name,
                        product_type: offer.product.product_type,
                        product_sold_status: offer.product.product_sold_status,
                        price: offer.product.price,
                        description: offer.product.description
                    },
                    price: offer.price
                }
            else
                render status: 472, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end

    # POST /offers/:id
    # See outlines/offer_api.txt
    def update
        offer = Offer.find(params[:id])
        if offer
            if @current_user.id == offer.user.id
                if offer.offer_status == Offer.OFFER_OFFERED
                    offer.price = params[:price] if params[:price]
                    if offer.save()
                        payload = {
                            error: false,
                            id: offer.id
                        }
                        render status: 200, json: payload
                    else
                        errors = []
                        offer.errors.keys.each do |key|
                            errors << {field: key, message: offer.errors.full_messages_for(key).first}
                        end
                        payload = {
                            error: true,
                            errors: errors
                        }
                        render status: 200, json: payload
                    end
                else
                    render status: 473, json: {error: true}
            else
                render status: 472, json: {error: true}
        else
            render status: 404, json: {error: true}
        end
    end
    
    # POST /offers/accept/:id
    # See outlines/offer_api.txt
    def accept
        offer = Offer.find(params[:id])
        if offer    
            if offer.product.user.id == @current_user.id
                if offer.offer_status == Offer.OFFER_OFFERED
                    conversation = Conversation.new
                    conversation.seller = @current_user
                    conversation.buyer = offer.user
                    conversation.offer = offer
                    conversation.save()
                    
                    offer.offer_status = Offer.OFFER_ACCEPTED
                    offer.conversation_id = conversation.id
                    offer.save()
                    
                    offer.product.sold_status = Product.SOLD_IN_TRANSACTION
                    offer.product.save()
                    
                    render status: 200, json: {conversation_id: conversation.id}
                else
                    render status: 471, json: {error: true}
                end
            else
                render status: 472, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end
    
    # DELETE /offers/:id
    # See outlines/offer_api.txt
    def delete
        offer = offer.find(params[:id])
        if offer
            if offer.user.id == @current_user.id || offer.product.user.id == @current_user.id
                if offer.offer_status != Offer.OFFER_COMPLETED
                    offer.destroy
                    render status: 200, json: {error: false}
                else
                    render status: 473, json: {error: true}
                end
            else
                render status: 472, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end
    
    # POST /offers/complete/:id
    # See outlines/offer_api.txt
    def commit
        offer = Offer.find(params[:id])
        if offer
            if offer.product.user_id == @current_user.id
                if offer.offer_status != Offer.OFFER_COMPLETED
                    conversation = offer.conversation
                    conversation.destroy
                    
                    product = offer.product
                    product.sold_status = Product.SOLD_SOLD
                    product.save
                    
                    offer.offer_status = Offer.OFFER_COMPLETED
                    offer.save
                    render status: 200, json: {error: false, id: offer.id}
                else
                    render status: 471, json: {error: true}
                end
            else
                render status: 472, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end

end
