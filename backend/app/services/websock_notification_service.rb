class WebsockNotificationService

	require 'thread'
	require 'eventmachine'
	require 'securerandom'

	def init
		@user_map = Hash.new(0)
		@mutex = Mutex.new

		@notification_token = SecureRandom.uuid
		@prev_notification_token = @notification_token

		@client = nil
	end

	def inject_sockets(server)
		@client = server.get_client
		@client.add_extension(NotifClientExtension.new self)
	end

	def create_session(user_id, session_id, device_type)
		if device_type.to_sym == :WEB_SOCKET
			@mutex.synchronize do
				@user_map[user_id] = @user_map[user_id] + 1
			end
		end
	end

	def delete_session(user_id, session_id)
		@mutex.synchronize do
			@user_map[user_id] = @user_map[user_id] - 1
		end
	end

	def add_notification(user_id, notification_type, notification_value)

		user_session_count = @user_map[user_id]
		if user_session_count > 0

			username = User.find_by_id(user_id).username

			if @client
				pbl = @client.publish "/user/#{username}", {"type" => notification_type, "value" => notification_value}
			end

			true

		else
			false
		end
	end

	def add_session_notification(session_id, notification_type, notification_value)

		if @client
			pbl = @client.publish "/session/#{session_id}", {"type" => notification_type, "value" => notification_value}
		end
		true

	end

	def broadcast(notification_type, notification_value)
		if @client
			pbl = @client.publish "/broadcast", {"type" => notification_type, "value" => notification_value, "special" => "BROADCAST"}
		end

		true
	end

	def notification_token
		@notification_token
	end

	def verify_token(token)
		token == @notification_token or token == @prev_notification_token
	end

	def run_maintenance
		@prev_notification_token = @notification_token
		@notification_token = SecureRandom.uuid
	end

	class NotifClientExtension
		
		def initialize(service)
			@service = service
		end

		def outgoing(message, callback)
			message['ext'] ||= Hash.new
			message['ext']['user_id'] = 0
			message['ext']['notification_token'] = @service.notification_token
			callback.call(message)
		end

	end

end
