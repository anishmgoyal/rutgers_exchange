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
	# Returns an object with the sessionToken and csrfToken for the created session
	def create(user_id)
		sessionToken = SecureRandom.uuid
		csrfToken = SecureRandom.uuid
		
		# Make sure we have a unique session token. Statistically, this loop will *almost* never run.
		while @sessions[sessionToken]
			sessionToken = SecureRandom.uuid
		end
		
		session_meta = SessionMeta.new(user_id, csrfToken)
		@sessions[sessionToken] = session_meta
		
		return {
            user_id: user_id,
			sessionToken: sessionToken,
			csrfToken: csrfToken
		}
	end
	
	# Verifies that a session is valid for a userId, sessionToken, and csrfToken
	# userId: the userId of the user
	# sessionToken: the session token received when the session was created
	# csrfToken: the csrf token received when the session was created
	# Returns:
	#		:SESSION_VALID if the session is valid
	#		:SESSION_AUTH_ERR if the csrfToken is incorrect
	#		:SESSION_EXPIRED if the session has expired
	#		:SESSION_NOEXIST if the session does not exist
	def verify(userId, sessionToken, csrfToken)
		session_meta = @sessions[sessionToken]
		if session_meta
			if session_meta.verify_active()
				if session_meta.csrfToken == csrfToken && session_meta.userId == userId
					return :SESSION_VALID
				else
					return :SESSION_AUTH_ERR
				end
			else
				delete(userId, sessionToken, csrfToken)
				return :SESSION_EXPIRED
			end
		else
			return :SESSION_NOEXIST
		end
	end
	
	# Deletes a session (logs out a user)
	# userId: the userId to log out
	# sessionToken: the session token received when the session was created
	# csrfToken: the csrf token received when the session was created
	# Returns:
	#		:SESSION_DELETED if the session was deleted successfully
	#		:SESSION_AUTH_ERR if the csrfToken is incorrect
	#		:SESSION_NOEXIST if the sessionToken is incorrect
	def delete(userId, sessionToken, csrfToken)
		session_meta = @sessions[sessionToken]
		if session_meta
			if session_meta.csrfToken == csrfToken && session_meta.userId == userId
				@sessions.delete(sessionToken)
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

	@@EVICT_TIMER = 60 * 60 # Seconds in a minute times minutes in an hour = 1 hour timeout
	
	# Constructor
	def initialize(userId, csrfToken)
		@userId = userId
		@csrfToken = csrfToken
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
	
end