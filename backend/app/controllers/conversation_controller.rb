class ConversationController < ApplicationController

    include SessionsHelper
    
    before_filter :require_auth

    # GET /conversation
    # Gets a list of conversations the current user is a part of
    # See outlines/conversation_api.txt
    def list
        convos_for_json = []
        conversations = @current_user.conversations
        conversations.each do |conversation|
            other_user = conversation.seller
            is_seller = false
            if other_user.id == @current_user.id
                other_user = conversation.buyer
                is_seller = true
            end
            prev_message = conversation.messages.last
            prev_message_message = prev_message?.message
            prev_message_sent_on = prev_message?.created_on
            convo_for_json = {
                user_id_of_other: other_user.id,
                username_of_other: other_user.username,
                first_name_of_other: other_user.first_name,
                last_name_of_other: other_user.last_name,
                is_seller: is_seller,
                prev_message: {
                    message: prev_message_message,
                    date_sent: prev_message_sent_on
                }
            }
            convos_for_json << convo_for_json
        end
        render status: 200, json: {conversations: conversations}
    end
    
    # GET /conversation/:id
    # Gets messages from a conversation
    # See outlines/conversation_api.txt
    def read
        conversation = Conversation.find(params[:id])
        if conversation
            if conversation.buyer_id == @current_user.id || conversation.seller_id == @current_user.id
            
                params[:messages_per_page] ||= 10
                params[:page] ||= 1
                offset = (params[:page] - 1) * params[:messages_per_page]
            
                message_ids = conversation.messages_singular_ids
                
                messages.where(id: message_ids)
                        .limit(params[:messages_per_page])
                        .offset(offset)
                        .order(created_at: :desc)
                        .all
                
                messages_for_json = []
                messages.each do |message|
                    messages_for_json << {
                        user_id: message.user_id,
                        message: message.message,
                        date_sent: message.created_on
                    }
                end
                payload = {
                    seller: {
                        user_id: conversation.seller.id,
                        username: conversation.seller.username,
                        first_name: conversation.seller.first_name,
                        last_name: conversation.seller.last_name
                    },
                    buyer: {
                        user_id: conversation.buyer.id,
                        username: conversation.buyer.username,
                        first_name: conversation.buyer.first_name,
                        last_name: conversation.buyer.last_name
                    },
                    product: {
                        product_id: conversation.offer.product.id,
                        product_name: conversation.offer.product.product_name,
                        price: conversation.offer.product.price,
                        product_type: conversation.offer.product.product_type
                    },
                    offer: {
                        offer_id: conversation.offer.id,
                        price: conversation.offer.price
                    },
                    messages: messages_for_json
                }
                render status: 200, json: payload
            else
                render status: 472, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end
    
    # PUT /conversation/:id
    # Adds a message to a conversation
    # See outlines/conversation_api.txt
    def update
        conversation = Conversation.find(params[:id])
        if conversation
            if conversation.buyer_id == @current_user.id || conversation.seller_id == @current_user.id
                message = Message.new
                message.message = params[:message]
                message.conversation = conversation
                message.user = @current_user
                if message.save()
                    payload = {
                        error: false,
                        id: message.id
                    }
                    render status: 200, json: payload
                else
                    errors = []
                    message.errors.keys.each do |key|
                        errors << {field: key, message: message.errors.full_messages_for(key).first}
                    end
                    payload = {
                        error: true,
                        errors: errors
                    }
                    render status: 200, json: payload
                end
            else
                render status: 472, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end

end
