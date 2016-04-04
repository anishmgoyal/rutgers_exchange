class Product < ActiveRecord::Base

    # Accessor directives
    attr_accessible :product_name, :product_type, :price

    # Relations
    belongs_to :user
    has_many :offers
    has_many :product_images
    
    # Constants
    @@SOLD_NOT_SOLD = "SOLD_NOT_SOLD"
    @@SOLD_IN_TRANSACTION = "SOLD_IN_TRANSACTION"
    @@SOLD_SOLD = "SOLD_SOLD"

    @@CONDITION_NA = "CONDITION_NA"
    @@CONDITION_NEW = "CONDITION_NEW"
    @@CONDITION_EXCELLENT = "CONDITION_EXCELLENT"
    @@CONDITION_GOOD = "CONDITION_GOOD"
    @@CONDITION_FAIR = "CONDITION_FAIR"
    @@CONDITION_POOR = "CONDITION_POOR"
    @@CONDITION_FORPARTS = "CONDITION_FORPARTS"
    
    @@SOLD_STATUS = [@@SOLD_NOT_SOLD, @@SOLD_IN_TRANSACTION, @@SOLD_SOLD]
    @@CONDITION = [@@CONDITION_NA, @@CONDITION_NEW, @@CONDITION_EXCELLENT, @@CONDITION_GOOD, @@CONDITION_FAIR, @@CONDITION_POOR, @@CONDITION_FORPARTS]
    
    # Validation
    @@PRICE_REGEX = /\A[0-9]+\z/
    validates :product_name, presence: true
    validates :product_type, presence: true
    validates :price, presence: true, format: @@PRICE_REGEX, numericality: {greater_than_or_equal_to: 0}
    validates :sold_status, presence: true, inclusion: { in: @@SOLD_STATUS }
    validates :condition, presence: true, inclusion: { in: @@CONDITION }
    validates :description, length: { in: 0..2500 }
    
    after_save :index_product
    before_save :delete_index
    before_destroy :delete_index
    before_destroy :delete_offers

    def index_product
        SearchEntry.build_index self if self.is_published
    end

    def delete_index
        SearchEntry.destroy_index self
    end
    
    def delete_offers
        offers.each do |offer|
            offer.destroy
        end
    end

    def thumbnail
	return ProductImage.default_image unless self.product_image_ids.length > 0
        return File.join(self.product_images.first.image_location, self.product_images.first.id.to_s)
    end
	
	#Static Accessors
	def self.SOLD_NOT_SOLD
		@@SOLD_NOT_SOLD
	end
	
	def self.SOLD_IN_TRANSACTION
		@@SOLD_IN_TRANSACTION
	end
	
	def self.SOLD_SOLD
		@@SOLD_SOLD
	end

    def self.published
        where is_published: true
    end

    def self.with_drafts(user_id)
        where "`products`.`is_published` = ? OR `products`.`user_id` = ?", true, user_id
    end

end
