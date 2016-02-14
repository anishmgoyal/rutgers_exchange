class ProductImage < ActiveRecord::Base

	# Relations
	belongs_to :user
	belongs_to :product

	# Validation
	validates :ordinal, numericality: {greater_than_or_equal_to: 0, less_than: 8}
	validates :session_id, presence: true
	validates :content_type, presence: true

	# For sorting
	default_scope { order :ordinal }

	def update_product_information(current_user, ordinal, product_id)
		if current_user.id == self.user_id
			self.ordinal = ordinal
			self.product_id = product_id
			self.save()
		end
	end

	def self.default_image
		"notfound.png"
	end

	def self.delete_dangling(session_id)
		puts "Deleting dangling"
		ProductImage.where(session_id: session_id).all.each do |image|
			puts "Processing image"
			unless image.product_id
				puts "Dangling image found"
				fpath = Rails.root.join("app", "assets", "images", image.image_location, image.id.to_s)
				File.delete fpath if File.exists? fpath
				image.destroy()
			end
		end
	end

end
