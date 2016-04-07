class UserMailer < ApplicationMailer

	include ApplicationHelper

	def activation_email(user)
		@user = user
		@url = "#{@@DEFAULT_WEBAPP_URL}/#!/activate/#{user.username}/#{user.activation}"
		@app_name = @@APPLICATION_BACKEND_NAME
		mail(to: user.email_address, subject: "Account Activation")
	end

	def password_recovery_email(user, recovery_request)
		@user = user
		@code = recovery_request.recovery_code
		@url = "#{@@DEFAULT_WEBAPP_URL}/#!/forgotpassword/reset/#{recovery_request.recovery_string}/#{user.id}"
		@url_del = "#{@@DEFAULT_WEBAPP_URL}/#!/forgotpassword/undo/#{recovery_request.recovery_string}/#{user.id}"
		@app_name = @@APPLICATION_BACKEND_NAME
		mail(to: user.email_address, subject: "Forgotten Password")
	end

end
