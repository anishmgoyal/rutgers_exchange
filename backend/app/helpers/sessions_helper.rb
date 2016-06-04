module SessionsHelper

    # See set_current_user
    # Renders a 403 if the user is not authenticated
    def require_auth
        # is_soft is false since failure to authenticate should fail
        set_current_user false
    end

    # See set_current_user
    # Allows unauthenticated users, but renders a 403 for expired sessions
    def check_auth
        # is_soft is true since failure to authenticate shouldn't fail
        set_current_user true
    end

    # Checks if a user is authenticated, and sets @current_user if true
    # BOOLEAN is_soft: true if unauthenticated users should be allowed, false if not
    # STRING params[:user_id] (request param): the id of the user
    # STRING params[:user_agent] (request param): the browser the user is using
    # STRING params[:session_token] (request param): the session_token for the current session
    # STRING params[:csrf_token] (request param): the csrf_token for the current session
    # RETURNS: true if the session is valid or none is provided
    #          false if the session is found but expired (renders 403, json: {error: e})
    #               e is one of the following: Session.SESSION_AUTH_ERR (session timed out)
    #                                          Session.SESSION_NO_EXIST (session params are incorrect)
    def set_current_user(is_soft)
        user_id = params[:user_id]
        session_token = params[:session_token]
        csrf_token = params[:csrf_token]
        user_agent = params[:user_agent] if params[:user_agent]
        user_agent ||= "undefined"

        session = Session.where(user_id: user_id, user_agent: user_agent, session_token: session_token, csrf_token: csrf_token)

        valid = is_soft
        status = Session.SESSION_VALID

        if session.count > 0
            session = session.first
            if session.updated_at > Time.now - 7.days
                # Update session activity flag
                session.updated_at = Time.now
                session.save

                @current_user = User.find user_id
                valid = true
            else
                delete_session(user_id, session_token, csrf_token)
                status = Session.SESSION_AUTH_ERR
            end
        else
            status = Session.SESSION_NO_EXIST
        end

        unless valid
            payload = {}
            payload[:error] = status
            redirect_to "#{params[:redirect]}?status=403&#{payload.to_query}" if params[:redirect]
            render status: 403, json: payload unless params[:redirect]
            false
        end
    end

    # Determines if a user is authenticated for faye
    # STRING user_id: id of the user being authenticated
    # STRING user_agent: the browser the user is using to connect to faye
    # STRING session_token: session_token of the session being used
    # STRING csrf_token: csrf_token of the session being used
    # RETURNS: User if valid
    #          nil if invalid
    def faye_auth(user_id, user_agent, session_token, csrf_token)
        session = Session.where(user_id: user_id, user_agent: user_agent, session_token: session_token, csrf_token: csrf_token).first
        if session && session.created_at > Time.now - 7.days
            User.find(user_id)
        else
            nil
        end
    end

    # Creates a session (usually invoked by the user controller which handles auth / deauth)
    # STRING user_id: id of the user being logged in
    # SYMBOL device_notification_type: the type of notifications the device is requesting
    #                                  supported values: :INCOMPAT_FOR_NOTIFS (no notifications)
    #                                                    :WEB_SOCKET (websocket notifications)
    #                                  in development:   :PUSH (mobile push notifications)
    # RETURNS: Session { user_id, session_token, csrf_token, device_type, etc.. see model Session }
    def create_session(user_id, device_notification_type=:INCOMPAT_FOR_NOTIFS)
        user_agent = params[:user_agent] if params[:user_agent]
        user_agent ||= "undefined"

        session = Session.new(user_id: user_id, user_agent: user_agent, device_notification_type: device_notification_type)
        if session.save
            # At the time this was written, websockets were being used for notifications
            # Currently, this method is not implemented. It may be in the future.
            # For short polling (still supported) this is necessary.
            notification_service = ApplicationService.get :NotificationService
            notification_service.create_session(user_id, session.session_token, device_notification_type)

            session
        else
            nil
        end
    end

    # Deletes a session (usually invoked by the user controller which handles auth / deauth)
    # STRING user_id: id of the user logging out
    # STRING session_token: session_token of the session being deleted
    # STRING csrf_token: csrf_token of the session being deleted
    # RETURNS: Session.SESSION_DELETED if the session was deleted
    #          Session.SESSION_NO_EXIST if the session did not exist
    def delete_session(user_id, session_token, csrf_token)
        session = Session.where(user_id: user_id, session_token: session_token, csrf_token: csrf_token).first
        if session
            # At the time this was written, websockets were being used for notifications
            # Currently, this method is not implemented. It may be in the future.
            # For short polling (still supported) this is necessary.
            notification_service = ApplicationService.get :NotificationService
            notification_service.delete_session(user_id, session.session_token)

            session.destroy
            Session.SESSION_DELETED
        else
            Session.SESSION_NO_EXIST
        end
    end

end
