class UserController < ApplicationController

    include SessionsHelper
    
    before_filter :require_auth, only: [:read, :update, :logout]

    def register
    
    end
    
    def login
    
    end
    
    def logout
    
    end
    
    def viewinfo
    
    end
    
	# PUT /users
	# Please see /outlines/user_api.txt
	def create
		user = User.new(params)
		if user.save()
			payload = {
				error: false,
				userId: user.id
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
		user = User.where(username: params[:username]).first
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
			render status: 404
		end
	end
	
	# POST /users/:id
	# Please see /outlines/user_api.txt
	def update
		user = User.find(params[:id])
        if user
            if @current_user.id == user.id
                if params[:password]
                    params[:encrypted_password] = nil
                end
                User.update(@current_user.id, params)
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
	
	# DELETE /users/:id
	# Please see /outlines/user_api.txt
	def logout
        delete_session(params[:id], params[:session_token], params[:csrf_token])
	end
	
end
