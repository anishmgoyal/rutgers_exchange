class UserController < ApplicationController

	# PUT /users
	# Please see /outlines/user_api.txt
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
	
	# GET /users/:username
	# Please see /outlines/user_api.txt
	def read
		user = User.where(username: params[:username]).first
		if user
			
		else
			render status: 404
		end
	end
	
	# POST /users/:id
	# Please see /outlines/user_api.txt
	def update
	
	end
	
	# PUT /users/:username
	# Please see /outlines/user_api.txt
	def authenticate
	
	end
	
	# DELETE /users/:id
	# Please see /outlines/user_api.txt
	def logout
	
	end
	
end
