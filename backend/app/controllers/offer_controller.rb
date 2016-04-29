class OfferController < ApplicationController

    include SessionsHelper
    include NotificationHelper
    
    before_filter :require_auth

    # PUT /offers
    # See outlines/offer_api.txt
    def create
        offer = Offer.where(user_id: @current_user.id, product_id: params[:product_id]).first
        if offer
            render status: 471, json: {error: true}
        else
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

                            notify("NOTIF_NEW_OFFER", {
                                user: {
                                    id: @current_user.id,
                                    username: @current_user.username,
                                    first_name: @current_user.first_name,
                                    last_name: @current_user.last_name,
                                },
                                offer: {
                                    id: offer.id,
                                    price: offer.price,
                                    created_at: offer.created_at.strftime('%-l:%M%P')
                                },
                                product: {
                                    id: product.id,
                                    product_name: product.product_name
                                }
                            }, product.user_id)

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
    end
    
    # Get /offers
    # See outlines/offer_api.txt
    def list
        offers = []
        if params[:product_id]
            product = Product.find(params[:product_id])
            if product && (product.sold_status != Product.SOLD_SOLD || params[:allow_sold])
                if product.user.id == @current_user.id && params[:include_offers_made_by_other_users] == "true"
                    product.offers.each do |offer|
                        offers << {
                            offer_id: offer.id,
                            product: {
                                user: {
                                    user_id: product.user.id
                                },
                                thumbnail: product.thumbnail,
                                product_id: product.id,
                                product_name: product.product_name,
                                product_price: product.price
                            },
                            product_name: product.product_name,
                            user: {
                                user_id: offer.user.id,
				                username: offer.user.username,
                                first_name: offer.user.first_name,
                                last_name: offer.user.last_name
                            },
                            conversation: offer.conversation ? {id: offer.conversation.id} : nil,
                            offer_status: offer.offer_status,
                            price: offer.price,
                            created_at: offer.created_at.strftime("%-m/%-d/%Y")
                        }
                    end
                elsif product.user.id != @current_user.id && params[:include_offers_made_by_current_user] == "true"
                    offer = Offer.find_by(product_id: product.id, user_id: @current_user.id)
                    if offer
                        offers << {
                            offer_id: offer.id,
                            product: {
                                user: {
                                    user_id: product.user.id,
				                    username: product.user.username
                                },
                                thumbnail: product.thumbnail,
                                product_id: product.id,
                                product_name: product.product_name,
                                product_price: product.price
                            },
                            product_name: product.product_name,
                            user: {
                                user_id: offer.user.id,
				                username: offer.user.username,
                                first_name: offer.user.first_name,
                                last_name: offer.user.last_name
                            },
                            conversation: offer.conversation ? {id: offer.conversation.id} : nil,
                            offer_status: offer.offer_status,
                            price: offer.price,
                            created_at: offer.created_at.strftime("%-m/%-d/%Y")
                        }
                    end
                end
            else
                render status: 404, json: {error: true}
            end
        else
            if params[:include_offers_made_by_current_user] == "true"
                @current_user.offers.each do |offer|
                    if (offer.product.sold_status != Product.SOLD_SOLD || params[:allow_sold])
                        offers << {
                            offer_id: offer.id,
                            product: {
                                user: {
                                    user_id: offer.product.user.id,
				                    username: offer.product.user.username
                                },
                                thumbnail: offer.product.thumbnail,
                                product_id: offer.product.id,
                                product_name: offer.product.product_name,
                                product_price: offer.product.price
                            },
                            product_name: offer.product.product_name,
                            user: {
                                user_id: offer.user.id,
				                username: offer.user.username,
                                first_name: offer.user.first_name,
                                last_name: offer.user.last_name
                            },
                            conversation: offer.conversation ? {id: offer.conversation.id} : nil,
                            offer_status: offer.offer_status,
                            price: offer.price,
                            created_at: offer.created_at.strftime("%-m/%-d/%Y")
                        }
                    end
                end
            end
            if params[:include_offers_made_by_other_users] == "true"
                @current_user.products.each do |product|
                    if (product.sold_status != Product.SOLD_SOLD || params[:allow_sold])
                        product.offers.each do |offer|
                            offers << {
                                offer_id: offer.id,
                                product: {
                                    user: {
                                        user_id: product.user.id,
                                        username: product.user.username
                                    },
                                    thumbnail: product.thumbnail,
                                    product_id: product.id,
                                    product_name: product.product_name,
                                    product_price: product.price
                                },
                                product_name: product.product_name,
                                user: {
                                    user_id: offer.user.id,
				                    username: offer.user.username,
                                    first_name: offer.user.first_name,
                                    last_name: offer.user.last_name
                                },
                                conversation: offer.conversation ? {id: offer.conversation.id} : nil,
                                offer_status: offer.offer_status,
                                price: offer.price,
                                created_at: offer.created_at.strftime("%-m/%-d/%Y")
                            }
                        end
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
                        product_sold_status: offer.product.sold_status,
                        price: offer.product.price,
                        description: offer.product.description,
                        thumbnail: offer.product.thumbnail,
                    },
                    conversation: offer.conversation ? {id: offer.conversation.id} : nil,
                    offer_status: offer.offer_status,
                    price: offer.price,
                    created_at: offer.created_at.strftime("%-m/%-d/%Y")
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
                if offer.offer_status != Offer.OFFER_COMPLETED
                    old_price = offer.price
                    offer.price = params[:price] if params[:price]
                    if offer.save()

                        notify("NOTIF_OFFER_UPDATED", {
                            user: {
                                id: offer.user.id,
                                username: offer.user.username,
                                first_name: offer.user.first_name,
                                last_name: offer.user.last_name
                            },
                            offer: {
                                id: offer.id,
                                prev_price: old_price,
                                price: offer.price
                            },
                            product: {
                                id: offer.product.id,
                                product_name: offer.product.product_name
                            }
                        }, offer.product.user_id)

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

                    notify("NOTIF_NEW_CONVERSATION", {
                        conversation: {
                            id: conversation.id,
                            is_seller: false,
                            prev_message: nil
                        },
                        user: {
                            id: @current_user.id,
                            username: @current_user.username,
                            first_name: @current_user.first_name,
                            last_name: @current_user.last_name
                        },
                        offer: {
                            id: offer.id,
                            price: offer.price
                        },
                        product: {
                            id: offer.product.id,
                            product_name: offer.product.product_name,
                            price: offer.product.price
                        }
                    }, offer.user_id)
                    
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
        offer = Offer.find(params[:id])
        if offer
            if offer.user.id == @current_user.id || offer.product.user.id == @current_user.id
                if offer.offer_status != Offer.OFFER_COMPLETED

                    if offer.user.id == @current_user.id
                        notify("NOTIF_OFFER_REVOKE", {
                            conversation: offer.conversation ? offer.conversation.id : nil,
                            user: {
                                id: offer.user.id,
                                username: offer.user.username,
                                first_name: offer.user.first_name,
                                last_name: offer.user.last_name
                            },
                            offer: {
                                price: offer.price
                            },
                            product: {
                                id: offer.product.id,
                                product_name: offer.product.product_name
                            }
                        }, offer.product.user_id)
                    else
                        notify("NOTIF_OFFER_REJECT", {
                            conversation: offer.conversation ? offer.conversation.id : nil,
                            user: {
                                id: offer.product.user.id,
                                username: offer.product.user.username,
                                first_name: offer.product.user.first_name,
                                last_name: offer.product.user.last_name
                            },
                            offer: {
                                price: offer.price
                            },
                            product: {
                                id: offer.product.id,
                                product_name: offer.product.product_name
                            }
                        }, offer.user.id)
                    end

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
                    conversation_id = conversation.id
                    conversation.destroy

                    product = offer.product
                    product.sold_status = Product.SOLD_SOLD
                    product.save

                    SearchEntry.destroy_index product
                    
                    offer.offer_status = Offer.OFFER_COMPLETED
                    offer.save

                    notify("NOTIF_TRANSACTION_FINISHED", {
                        conversation: conversation_id,
                        user: {
                            id: @current_user.id,
                            username: @current_user.username,
                            first_name: @current_user.first_name,
                            last_name: @current_user.last_name
                        },
                        product: {
                            id: product.id,
                            product_name: product.product_name
                        },
                        offer: {
                            price: offer.price
                        }
                    }, offer.user_id)

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
