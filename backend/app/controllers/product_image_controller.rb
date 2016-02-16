class ProductImageController < ApplicationController

	require 'fileutils'
	require 'securerandom'
	require 'mini_magick'
	include SessionsHelper

	before_filter :require_auth, except: [:read]

	def create
		if params[:product_id]

			files = params[:file]
			payload = {
				status: 200,
				results: []
			}
			files.first(8).each do |file|
				if file.content_type == "image/jpeg" || file.content_type == "image/png" || file.content_type == "image/jpg" || file.content_type == "image/gif"
					if file.size < 5242880 # 5MB
						image = ProductImage.new
						image.user = @current_user
						image.session_id = params[:session_token]
						image.image_location = File.join("user", "upload", @current_user.id.to_s, SecureRandom.uuid)
						image.content_type = file.content_type
						image.ordinal = 0
						image.product_id = params[:product_id]
						if image.save()
							begin

								image_dir = Rails.root.join("app", "assets", "images", image.image_location)
								image_location = File.join(image_dir, image.id.to_s)

								FileUtils.mkdir_p image_dir unless File.directory? image_dir
								out_file = File.open(image_location, "wb")
			                    out_file.write(file.read)
			                    out_file.close

							    fullsize = MiniMagick::Image.open(image_location)
							    fullsize.resize "600x600" if fullsize[:width] > 600 or fullsize[:height] > 600
							    fullsize.auto_orient
							    fullsize.write image_location

							    thumbnail = fullsize
							    thumbnail.resize "150x150" if thumbnail[:width] > 150 or thumbnail[:height] > 150
							    thumbnail.write "#{image_location}t"

			                    payload[:results] << {
			                    	status: 200,
			                        id: image.id,
									image_location: File.join(image.image_location, image.id.to_s),
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
					query_payload = {status: 500, json: {error: true, errors: ["Failed to get response from server on upload progress"]}}
					redirect_to "#{params[:redirect]}?#{query_payload.to_query}"
				end
			else
				render status: 200, text: "<html><head></head><body>#{payload.to_json}</body></html>"
			end
		else
			render status: 477, json: {error: true}
			return
		end
	end

	def read
		image = ProductImage.find_by id: params[:id]
		if image
			send_file Rails.root.join("app", "assets", "images", image.image_location, image.id.to_s), type: image.content_type, disposition: 'inline'
		else
			not_found_file = Rails.root.join("app", "assets", "images", "notfound.png")
			send_file not_found_file, disposition: "inline"
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

	def update_multi
		num_affected = 0
		map = params[:ordinal_map]
		prev_product_id = -1

		puts map if map
		
		map.each do |id, ordinal|
			image = ProductImage.find_by id: id
			if image && image.user_id == @current_user.id
				if prev_product_id == -1 or prev_product_id == image.product_id
					image.ordinal = ordinal
					if image.save()
						num_affected = num_affected + 1
					end
					prev_product_id = image.product_id
				end
			end
		end if map

		if map && num_affected == 0
			render status: 472, json: {error: true}
		else
			render status: 200, json: {error: false, id: prev_product_id}
		end
	end

	def delete
		image = ProductImage.find_by id: params[:id]
		if image
			if image.user_id == @current_user.id
				file_path = Rails.root.join("app", "assets", "images", image.image_location, image.id.to_s)
				File.delete file_path if File.exists? file_path

				file_path = "#{file_path}t"
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
