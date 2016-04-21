class UserMailer < ApplicationMailer

	include ApplicationHelper

	require 'cgi'

	def activation_email(user)
		@user = user
		@url = "#{@@DEFAULT_WEBAPP_URL}/#!/activate/#{user.username}/#{user.activation}"
		@app_name = @@APPLICATION_BACKEND_NAME
		mail(to: user.email_address, subject: "Account Activation")
	end

	def password_recovery_email(user, recovery_request)
		@user = user
		@code = recovery_request.recovery_code
		recovery_string = encodeURIComponent recovery_request.recovery_string
		@url = "#{@@DEFAULT_WEBAPP_URL}/#!/recover/apply/#{recovery_string}/#{user.id}"
		@url_del = "#{@@DEFAULT_WEBAPP_URL}/#!/recover/remove/#{recovery_string}/#{user.id}"
		@app_name = @@APPLICATION_BACKEND_NAME
		mail(to: user.email_address, subject: "Forgotten Password")
	end

	def gsub(input, replace)
		search = Regexp.new(replace.keys.map{|x| "(?:#{Regexp.quote(x)})"}.join('|'))
		input.gsub(search, replace)
	end

	def encodeURIComponent(str)
        gsub(
        	CGI.escape(str.to_s),
            '+'   => '%20',  '%21' => '!',  '%27' => "'",  '%28' => '(',  '%29' => ')',  '%2A' => '*', '%7E' => '~'
        )
	end

end
