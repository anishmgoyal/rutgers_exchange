class UserMailer < ApplicationMailer

	include ApplicationHelper

	def activation_email(user)
		@user = user
		@url = "#{@@DEFAULT_WEBAPP_URL}/#!/activate/#{user.username}/#{user.activation}"
		@app_name = @@APPLICATION_BACKEND_NAME
		mail(to: user.email_address, subject: "Account Activation")
	end

	def forgot_password_email(user)
		@user = user
		@url = "#{@@DEFAULT_WEBAPP_URL}/#!/forgotpassword"
		@app_name = @@APPLICATION_BACKEND_NAME
		mail(to: user.email_address, subject: "Forgotten Password")
	end

end