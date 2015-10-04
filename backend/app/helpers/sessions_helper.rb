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
			render status: 403, json: payload
			return false
		end
	end
    
    def check_auth
        session_service = ApplicationService.get :SessionService
        
        user_id = params[:user_od]
        session_token = params[:session_token]
        csrf_token = params[:csrf_token]
        
        session_status = session_service.verify(user_id, session_token, csrf_token)
        
        if session_status == :SESSION_VALID
            @current_user = user.find(user_id)
        end 
    end
    
    def create_session(user_id)
        session_service = ApplicationService.get :SessionService
        session_service.create(user_id) # Returned
    end
    
    def delete_session(user_id, session_token, csrf_token)
        session_service = ApplicationService.get :SessionService
        session_service.delete(user_id, session_token, csrf_token)
    end

end