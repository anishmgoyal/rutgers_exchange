module SessionsHelper

    # Checks, using parameters, if a user is authenticated.
    # If not, it returns a 403 error and the related reason for the error.
    # If so, it sets @current_user to the current user.
	def require_auth
		session_service = ApplicationService.get :SessionService
	
		user_id = params[:userId]
		session_token = params[:sessionToken]
		csrf_token = params[:csrfToken]
		
		session_status = session_service.verify(user_id, session_token, csrfToken)
		
		if :SESSION_VALID
			@current_user = User.find(user_id)
			return true
		else
			payload = {}
			payload[:error] = session_status.to_s
			render status: 403, json: payload
			return false
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