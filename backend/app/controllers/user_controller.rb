class UserController < ApplicationController

    include SessionsHelper
    include NotificationHelper

    require 'securerandom'
    
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
        user.first_name = params[:first_name]
        user.last_name = params[:last_name]
        user.activation = SecureRandom.hex 16
        
		if user.save()
            UserMailer.activation_email(user).deliver_later!
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
            
               user.encrypted_password = nil if params[:password]
               user.password = params[:password] if params[:password]
               user.password_confirmation = params[:password_confirmation] if params[:password]
               user.first_name = params[:first_name] if params[:first_name]
               user.last_name = params[:last_name] if params[:last_name]
               
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
            if user.activation == "ACTIVATION_ACTIVE"
                session = create_session(user.id, device_type)
                render status: 200, json: session
            else
                render status: 405, json: {error: true, message: "Your account has not yet been activated. Please check your emails for an activation link."}
            end
        else
            render status: 403, json: {error: true, message: "Invalid username or password."}
        end
	end
	
	# DELETE /users/:username
	# Please see /outlines/user_api.txt
    def logout
        payload = delete_session(params[:user_id], params[:session_token], params[:csrf_token])
        if payload == :SESSION_DELETED
            notify_session("SESSION_END_NOTICE", {reason: "LOGOUT"}, params[:session_token])
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

    # This changes the activation status of a user from not active to active
    def activate
        user = User.find_by_username params[:username]
        if user && user.activation == params[:activation]
            user.activation = "ACTIVATION_ACTIVE"
            user.save()
            render status: 200, json: {error: false}
        else
            render status: 403, json: {error: true}
        end
    end
	
end