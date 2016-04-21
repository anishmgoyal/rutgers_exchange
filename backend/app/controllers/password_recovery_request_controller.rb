class PasswordRecoveryRequestController < ApplicationController

	# PUT /recover
	def create
		puts params[:email_address]
		user = User.find_by_email_address(params[:email_address])
		if user
			recovery_request = PasswordRecoveryRequest.find_by_user_id user.id
			
			if recovery_request
				cutoff = recovery_request.updated_at + 7.days
				valid = (cutoff >= Date.today)? true : false
				unless valid
					recovery_request.destroy
					recovery_request = nil
				end
			end

			unless recovery_request
				recovery_request = PasswordRecoveryRequest.new
				recovery_request.user = user
				recovery_request.is_valid = 1
				recovery_request.save
				begin
					UserMailer.password_recovery_email(user, recovery_request).deliver_later
				rescue
					recovery_request.destroy
					render status: 500, json: {error: true}
					return
				end
				render status: 200, json: {error: false}
			else
				render status: 472, json: {error: true}
			end
		else
			render status: 404, json: {error: true}
		end
	end

	# GET /recover/:string/:user_id
	def check
		recovery_request = PasswordRecoveryRequest.find_by_user_id params[:user_id]
		if recovery_request && recovery_request.recovery_string == params[:string] && recover_request.is_valid == 1
			render status: 200, json: {error: false}
		else
			render status: 404, json: {error: true}
		end
	end

	# POST /recover/:string/:user_id
	def apply
		recovery_request = PasswordRecoveryRequest.find_by_user_id params[:user_id]
		if recovery_request && recovery_request.recovery_string == params[:string]

			# Check that this request was made within 1 week
			cutoff = recovery_request.updated_at + 7.days
			valid = (cutoff >= Date.today)

			valid = (valid && recovery_request.recovery_code.to_s == params[:recovery_code])

			valid = (valid && recovery_request.is_valid == 1)

			user = User.find_by_id params[:user_id]
			if valid && user
				user.encrypted_password = nil
				user.password = params[:password]
				user.password_confirmation = params[:password_confirmation]
				if user.save
					recovery_request.destroy
					payload = {
						error: false,
						id: user.id
					}
					render status: 200, json: payload
				else
					errors = []
					user.errors.keys.each do |key|
						errors << {field: key, message: user.errors.full_messages_for(key).first}
					end
					payload = {
						error: true,
						errors: errors
					}
					render status: 200, json: payload
				end
			else
				render status: 404, json: {error: true}
			end
		else
			render status: 404, json: {error: true}
		end
	end

	# DELETE /recover/:string/:user_id
	def delete
		recovery_request = PasswordRecoveryRequest.find_by_user_id params[:user_id]
		if recovery_request && recovery_request.recovery_string == params[:string]
			recovery_request.is_valid = 0
			recovery_request.save
			render status: 200, json: {error: false, user_id: params[:user_id]}
		else
			render status: 404, json: {error: true}
		end
	end

end
