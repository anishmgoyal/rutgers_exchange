# Stores a list of sessions, with metadata about them
class SessionService

	require 'time'
	require 'securerandom'
	
	# This is not the constructor. This is the service initializer.
	# Initializes an empty sessions hash
	def init
		@sessions = Hash.new
	end

	# Creates a new session
	# user_id: the user_id of the user to create a session for
	# Returns an object with the session_token and csrf_token for the created session
	def create(user_id)
		session_token = SecureRandom.uuid
		csrf_token = SecureRandom.uuid
		
		# Make sure we have a unique session token. Statistically, this loop will *almost* never run.
		while @sessions[session_token]
			session_token = SecureRandom.uuid
		end
		
		session_meta = SessionMeta.new(user_id, csrf_token)
		@sessions[session_token] = session_meta
		
		return {
            user_id: user_id,
			session_token: session_token,
			csrf_token: csrf_token
		}
	end
	
	# Verifies that a session is valid for a user_id, session_token, and csrf_token
	# user_id: the user_id of the user
	# session_token: the session token received when the session was created
	# csrf_token: the csrf token received when the session was created
	# Returns:
	#		:SESSION_VALID if the session is valid
	#		:SESSION_AUTH_ERR if the csrf_token is incorrect
	#		:SESSION_EXPIRED if the session has expired
	#		:SESSION_NOEXIST if the session does not exist
	def verify(user_id, session_token, csrf_token)
		session_meta = @sessions[session_token]
		if session_meta
			if session_meta.verify_active()
				if session_meta.csrf_token.to_s == csrf_token.to_s && session_meta.user_id.to_s == user_id.to_s
					return :SESSION_VALID
				else
					return :SESSION_AUTH_ERR
				end
			else
				delete(user_id, session_token, csrf_token)
				return :SESSION_EXPIRED
			end
		else
			return :SESSION_NOEXIST
		end
	end
	
	# Deletes a session (logs out a user)
	# user_id: the user_id to log out
	# session_token: the session token received when the session was created
	# csrf_token: the csrf token received when the session was created
	# Returns:
	#		:SESSION_DELETED if the session was deleted successfully
	#		:SESSION_AUTH_ERR if the csrf_token is incorrect
	#		:SESSION_NOEXIST if the session_token is incorrect
	def delete(user_id, session_token, csrf_token)
		session_meta = @sessions[session_token]
		if session_meta
			if session_meta.csrf_token.to_s == csrf_token.to_s && session_meta.user_id.to_s == user_id.to_s
				@sessions.delete(session_token)
				return :SESSION_DELETED
			else
				return :SESSION_AUTH_ERR
			end
		else
			return :SESSION_NOEXIST
		end
	end

end

# Should not be used outside of this service.
class SessionMeta

    attr_accessor :user_id
    attr_accessor :csrf_token

	@@EVICT_TIMER = 60 * 60 # Seconds in a minute times minutes in an hour = 1 hour timeout
	
	# Constructor
	def initialize(user_id, csrf_token)
		@user_id = user_id
		@csrf_token = csrf_token
		@time = Time.now
	end
	
	# Checks if a session is active. If it is, then it updates the time.
	# Returns true if active, false if not.
	def verify_active
		time = Time.now
		if time - @time < @@EVICT_TIMER
			@time = time
			return true
		else
			return false
		end
	end
    
    def to_s
        "#{@user_id} :: #{@csrf_token} :: #{@time}"
    end
	
end