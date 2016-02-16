class UserController < ApplicationController

    include SessionsHelper
    
    before_filter :require_auth, only: [:update, :logout, :verify_session]
    before_filter :check_auth, only: [:read]
    
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
                last_name: user.last_name,
                created_at: user.created_at.strftime("%-m/%-d/%Y")
            }
			if @current_user and @current_user.id == user.id
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
            
               @current_user.encrypted_password = nil if params[:password]
               @current_user.password = params[:password] if params[:password]
               @current_user.password_confirmation = params[:password_confirmation] if params[:password]
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
        device_type = params[:device_type] if params[:device_type]
        device_type ||= :INCOMPAT_FOR_NOTIFS
        if user
            session = create_session(user.id, device_type)
            render status: 200, json: session
        else
            render status: 403, json: {error: true, message: "Invalid username or password."}
        end
	end
	
	# DELETE /users/:username
	# Please see /outlines/user_api.txt
    def logout
        payload = delete_session(params[:user_id], params[:session_token], params[:csrf_token])
        if payload == :SESSION_DELETED
            render status: 200, json: {error: false}
        elsif payload == :SESSION_NO_AUTH
            render status: 403, json: {error: true}
        else
            render status: 404, json: {error: true}
        end
    end

    # This has a require_auth filter, and does nothing - so you can check the status
    # code of the response to see if the session is valid.
    def verify_session
        render status: 200, json: {error: false}
    end
	
end
