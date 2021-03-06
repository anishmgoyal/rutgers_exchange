class ServerExt

	include SessionsHelper

	def incoming(message, callback)

		message['ext'] ||= Hash.new

		if message['ext']['user_id'] == 0

			primary_token = ServerConfigOption.get_option "WebsockNotificationService/notification_token"
			secondary_token = ServerConfigOption.get_option "WebsockNotificationService/prev_notification_token"
			provided_token = message['ext']['notification_token']

			unless provided_token == primary_token or provided_token == secondary_token
				message['error'] = '403::Forbidden'
			end

		else
			if message['channel'] == '/meta/subscribe'
				unless message['subscription'] == "/broadcast"
					@current_user = faye_auth(message['ext']['user_id'], message['ext']['user_agent'], message['ext']['session_token'], message['ext']['csrf_token'])

					unless @current_user
						unless "/session/#{message['ext']['session_token']}" == message['subscription']
							unless "/user/#{@current_user.username}" == message['subscription']
								message['error'] = '403::Forbidden'
							end
						end
					end
				end
			else
				message['error'] = '403::Forbidden' if message['channel'].starts_with? "/user"
			end
		end

		callback.call(message)
	end
end
