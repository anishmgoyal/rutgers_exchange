class WebsockNotificationService

	require 'thread'
	require 'eventmachine'
	require 'securerandom'
	require 'uri'
	require 'net/http'

	def init
		@notification_token = SecureRandom.uuid
		@prev_notification_token = @notification_token

		ServerConfigOption.set_option("WebsockNotificationService/notification_token", @notification_token)
		ServerConfigOption.set_option("WebsockNotificationService/prev_notification_token", @prev_notification_token)

		@client = nil
	end

	def inject_sockets(server)
		@client = server.get_client
		@client.add_extension(NotifClientExtension.new self)
	end

	def create_session(user_id, session_id, device_notification_type)
		# Not implemented - not required
	end

	def delete_session(user_id, session_id)
		# Not implemented - not required
	end

	def add_notification(user_id, notification_type, notification_value)

		user_session_count = Session.where(user_id: user_id, device_notification_type: "WEB_SOCKET").count
		if user_session_count > 0

			username = User.find_by_id(user_id).username

			message = {
				channel: "/user/#{username}", 
				data: {"type" => notification_type, "value" => notification_value},
				ext: {user_id: 0, notification_token: notification_token}
			}
			uri = URI.parse(Rails.application.config.faye_server)
			Net::HTTP.post_form(uri, message: message.to_json)

			true

		else
			false
		end
	end

	def add_session_notification(session_id, notification_type, notification_value)
		message = {
			channel: "/session/#{session_id}",
			data: {"type" => notification_type, "value" => notification_value},
			ext: {user_id: 0, notification_token: notification_token}
		}
		uri = URI.parse(Rails.application.config.faye_server)
		Net::HTTP.post_form(uri, message: message.to_json)

		true
	end

	def broadcast(notification_type, notification_value)
		message = {
			channel: "/broadcast",
			data: {"type" => notification_type, "value" => notification_value, "special" => "BROADCAST"},
			ext: {user_id: 0, notification_token: notification_token}
		}
		uri = URI.parse(Rails.application.config.faye_server)
		Net::HTTP.post_form(uri, message: message.to_json)

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
