class ServerExt

	include SessionsHelper

	def incoming(message, callback)
		if message.channel == '/meta/subscribe'
			@current_user = faye_auth(message.ext.user_id, message.ext.session_token, message.ext.csrf_token)
			unless @current_user && "/user/#{@current_user.username}" == message.subscription
				message.error = '401::Unauthorized'
			end
		else
			message.error = '401::Unauthorized'
		end

		callback.call(message)
	end
end
