class ProductImageController < ApplicationController

	require 'fileutils'
	require 'securerandom'
	include SessionsHelper

	before_filter :require_auth, except: [:read]

	def create

		unsorted_count = ProductImage.where(user_id: @current_user.id, product_id: nil).count
		if unsorted_count > 29
			redirect_to "#{params[:redirect]}?status=477&error=true" if params[:redirect]
			render status: 477, json: {error: true} unless params[:redirect]
			return
		end

		files = params[:file]
		payload = {
			results: []
		}
		files.first(8).each do |file|
			if file.content_type == "image/jpeg" || file.content_type == "image/png" || file.content_type == "image/jpg" || file.content_type == "image/gif"
				if file.size < 5242880 # 5MB
					image = ProductImage.new
					image.user = @current_user
					image.session_id = params[:session_token]
					image.image_location = File.join("assets", "images", "upload", @current_user.id.to_s, SecureRandom.uuid)
					image.content_type = file.content_type
					image.ordinal = 0
					if image.save()
						begin
							FileUtils.mkdir_p Rails.root.join(image.image_location) unless File.directory? image.image_location
							out_file = File.open(Rails.root.join(image.image_location, image.id.to_s), "wb") #{ |out_file| out_file.write(file.read) }
		                    out_file.write(file.read)
		                    out_file.close

		                    payload[:results] << {
		                    	status: 200,
		                        id: image.id,
		                        error: false,
		                    	file_name: chomp(file.original_filename, 45)
		                    }
						rescue => e
							image.destroy()
							# Server IO Error
							payload[:results] << {
								status: 500,
								id: -1,
								error: true,
								file_name: chomp(file.original_filename, 45)
							}
						end
					else
	                    # Validation errors
						payload[:results] << {
							status: 200,
							id: -1,
							error: true,
							file_name: chomp(file.original_filename, 45)
						}
					end
				else
					# File size
					payload[:results] << {
						status: 476,
						id: -1,
						error: true,
						file_name: chomp(file.original_filename, 45)
					}
				end
			else
				# File mime
				payload[:results] << {
					status: 474,
					id: -1,
					error: true,
					file_name: chomp(file.original_filename, 45)
				}
			end
		end

		if params[:redirect]
			result = UploadResult.new
			result.user_id = @current_user.id
			result.output = payload.to_json
			if result.save()
				query_payload = {
					status: 200,
					error: false,
					result: result.id
				}
				redirect_to "#{params[:redirect]}?#{query_payload.to_query}"
			else
				render status: 500, json: {error: true, errors: ["Failed to get response from server on upload progress"]}
			end
		else
			render status: 200, json: payload
		end
	end

	def read
		image = ProductImage.find_by id: params[:id]
		if image
			image_file = File.open(Rails.root.join(image.image_location, image.id.to_s), 'rb')
			payload = image_file.read
			image_file.close
			render status: 200, text: payload, content_type: image.content_type
		else
			render status: 404, json: {error: true}
		end
	end

	def update
		image = ProductImage.find_by id: params[:id]
		if image
			if image.user_id == @current_user.id
				image.ordinal = params[:ordinal] if params[:ordinal]
				image.product_id = params[:product_id] if params[:product_id]
				if image.save()
                    payload = {
                        error: false,
                        id: image.id
                    }
                    render status: 200, json: payload
                else
                    errors = []
                    image.errors.keys.each do |key|
                        errors << {field: key, message: image.errors.full_messages_for(key).first}
                    end
                    payload = {
                        error: true,
                        errors: errors
                    }
                    render status: 200, json: payload
                end
			else
				render status: 472, json: {error: true}
			end
		else
			render status: 404, json: {error: true}
		end
	end

	def delete
		image = ProductImage.find_by id: params[:id]
		if image
			if image.user_id == @current_user.id
				file_path = Rails.root.join(image.image_location, image.id.to_s)
				File.delete file_path if File.exists? file_path
				image.destroy
				render status: 200, json: {error: false}
			else
				render status: 472, json: {error: true}
			end
		else
			render status: 404, json: {error: true}
		end
	end

	def get_response
		response = UploadResult.find_by id: params[:id]
		if response
			if response.user_id == @current_user.id
				response_text = response.output
				response.destroy
				render status: 200, text: response_text, content_type: "application/json"
			else
				render status: 472, json: {error: true}
			end
		else
			render status: 404, json: {error: true}
		end
	end

	private
		def chomp(str, len)
			if str.length > len
				"#{str[0, len-3]}..."
			else
				str
			end
		end
end
