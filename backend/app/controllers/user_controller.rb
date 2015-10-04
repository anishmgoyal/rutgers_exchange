class UserController < ApplicationController

    include SessionsHelper
    
    before_filter :require_auth, only: [:read, :update, :logout]

    def register
    
    end
    
    def login
    
    end
    
    def lo
        payload = delete_session(params[:user_id], params[:session_token], params[:csrf_token])
        if payload == :SESSION_DELETED
            render status: 200, json: {error: false}
        elsif payload == :SESSION_NO_AUTH
            render status: 403, json: {error: true}
        else
            render status: 404, json: {error: true}
        end
    end
    
    def viewinfo
       
    end
    
    def modify_account
    
    end
    
	# PUT /users
	# Please see /outlines/user_api.txt
	def create
		user = User.new()
        
        user.username = params[:username]
        user.password = params[:password]
        user.password_confirmation = params[:password_confirmation]
        user.email_address = params[:email_address]
        user.phone_number = params[:phone_number]
        user.first_name = params[:first_name]
        user.last_name = params[:last_name]
        
		if user.save()
			payload = {
				error: false,
				id: user.id
			}
			render status: 200, json: payload
		else
			errors = []
			user.errors.keys.each do |key|
				errors << {field: key, message: user.errors.full_messages_for(key).first}
			end
			payload = {
				error: true,
				errors: errors
			}
			render status: 200, json: payload
		end
	end
	
	# GET /users/:username
	# Please see /outlines/user_api.txt
	def read
		user = User.find_by_username(params[:username])
		if user
            payload = {
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name
            }
			if @current_user.id == user.id
                payload[:email_address] = user.email_address
                payload[:phone_number] = user.phone_number
            end
            render status: 200, json: payload
		else
			render status: 404, json: {error: true}
		end
	end
	
	# POST /users/:id
	# Please see /outlines/user_api.txt
	def update
		user = User.find(params[:id])
        if user
            if @current_user.id == user.id
            
               @current_user.username = params[:username] if params[:username]
               @current_user.encrypted_password = nil if params[:password]
               @current_user.password = params[:password] if params[:password]
               @current_user.password_confirmation = params[:password_confirmation] if params[:password]
               @current_user.email_address = params[:email_address] if params[:email_address]
               @current_user.phone_number = params[:phone_number] if params[:phone_number]
               @current_user.first_name = params[:first_name] if params[:first_name]
               @current_user.last_name = params[:last_nmae] if params[:last_name]
               
                if @current_user.save()
                    payload = {
                        error: false,
                        id: @current_user.id
                    }
                    render status: 200, json: payload
                else
                    errors = []
                    user.errors.keys.each do |key|
                        errors << {field: key, message: user.errors.full_messages_for(key).first}
                    end
                    payload = {
                        error: true,
                        errors: errors
                    }
                    render status: 200, json: payload
                end
            else
                render status: 403
            end
        else
            render status: 404
        end
	end
	
	# PUT /users/:username
	# Please see /outlines/user_api.txt
	def authenticate
        user = User.authenticate(params[:username], params[:password])
        if user
            session = create_session(user.id)
            render status: 200, json: session
        else
            render status: 403, json: {error: true, message: "Invalid username or password."}
        end
	end
	
	# DELETE /users/:username
	# Please see /outlines/user_api.txt
	def logout
        delete_session(params[:user_id], params[:session_token], params[:csrf_token])
	end
	
end
