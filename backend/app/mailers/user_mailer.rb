class UserMailer < ApplicationMailer

	include ApplicationHelper

	def activation_email(user)
		@user = user
		@url = "#{@@DEFAULT_WEBAPP_URL}/#!/activate"
		@app_name = @@APPLICATION_BACKEND_NAME
		mail(to: user.email_address, subject: "#{@app_name} :: Account Activation")
	end

end