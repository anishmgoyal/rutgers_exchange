module SessionsHelper

    # Checks, using parameters, if a user is authenticated.
    # If not, it returns a 403 error and the related reason for the error.
    # If so, it sets @current_user to the current user.
	def require_auth
		session_service = ApplicationService.get :SessionService
	
		user_id = params[:user_id]
		session_token = params[:session_token]
		csrf_token = params[:csrf_token]
		
		session_status = session_service.verify(user_id, session_token, csrf_token)
		
        logger.error "user_id: #{user_id}\nsession_token: #{session_token}\ncsrf_token: #{csrf_token}"
        logger.error "SESSION STATUS: #{session_status.to_s}"
        
		if session_status == :SESSION_VALID
			@current_user = User.find(user_id)
			return true
		else
			payload = {}
			payload[:error] = session_status.to_s
            redirect_to "#{params[:redirect]}?status=403&#{payload.to_query}" if params[:redirect]
			render status: 403, json: payload unless params[:redirect]
			return false
		end
	end
    
    def check_auth
        session_service = ApplicationService.get :SessionService
        
        user_id = params[:user_id]
        session_token = params[:session_token]
        csrf_token = params[:csrf_token]
        
        session_status = session_service.verify(user_id, session_token, csrf_token)
        
        if session_status == :SESSION_VALID
            @current_user = User.find(user_id)
            true
        elsif params[:user_id]
            # Provided with a user, but the session is invalid!
            payload = {}
            payload[:error] = session_status.to_s
            redirect_to "#{params[:redirect]}?status=403&#{payload.to_query}" if params[:redirect]
            render status: 403, json: payload unless params[:redirect]
            false
        else
            true
        end
    end

    def faye_auth(user_id, session_token, csrf_token)
	session_service = ApplicationService.get :SessionService
	session_status = session_service.verify(user_id, session_token, csrf_token)

	if session_status == :SESSION_VALID
	    User.find(user_id)
	else
	    nil
	end
    end
    
    def create_session(user_id, device_type=:INCOMPAT_FOR_NOTIFS)
        session_service = ApplicationService.get :SessionService
        session_service.create(user_id, device_type) # Returned
    end
    
    def delete_session(user_id, session_token, csrf_token)
        session_service = ApplicationService.get :SessionService
        session_service.delete(user_id, session_token, csrf_token)
    end

end
