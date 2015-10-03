class SessionService

	import Time
	import SecureRandom
	
	# This is not the constructor. This is the service initializer.
	def init
		@sessions = Hash.new
	end

	def create(user_id)
		sessionToken = SecureRandom.uuid
		csrfToken = SecureRandom.uuid
		
		# Make sure we have a unique session token. This shouldn't really be an issue, but hey - never hurts to check
		while @sessions[sessionToken]
			sessionToken = SecureRandom.uuid
		end
		
		session_meta = SessionMeta.new(userId, csrfToken)
		
		return {
			sessionToken: sessionToken,
			csrfToken: csrfToken
		}
	end
	
	def verify(userId, sessionToken, csrfToken)
		session_meta = @sessions[sessionToken]
		if session_meta
			if session_meta.verify()
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

class SessionMeta

	@@EVICT_TIMER = 60 * 60 # Seconds in a minute times minutes in an hour = 1 hour timeout
	
	def initialize(userId, csrfToken)
		@userId = userId
		@csrfToken = csrfToken
		@time = Time.now
	end
	
	def verify
		time = Time.now
		if time - @time < @@EVICT_TIMER
			@time = time
			return true
		else
			return false
		end
	end
	
end