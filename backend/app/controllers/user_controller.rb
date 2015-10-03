class UserController < ApplicationController

	def create
		user = User.new(params)
		if user.save()
			payload = {
				error: false,
				userId: user.id
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
	end
	
	def read
	
	end
	
	def update
	
	end
	
	def authenticate
	
	end
	
	def logout
	
	end
	
end
