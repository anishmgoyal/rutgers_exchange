class Product < ActiveRecord::Base

    # Accessor directives
    attr_accessible :product_name, :product_type, :price

    # Relations
    belongs_to :user
    has_many :offers
    
    # Constants
    @@SOLD_NOT_SOLD = "SOLD_NOT_SOLD"
    @@SOLD_IN_TRANSACTION = "SOLD_IN_TRANSACTION"
    @@SOLD_SOLD = "SOLD_SOLD"
    
    @@SOLD_STATUS = [@@SOLD_NOT_SOLD, @@SOLD_IN_TRANSACTION, @@SOLD_SOLD]
    
    # Validation
    PRICE_REGEX = /\A[0-9]{3,}\z/
    validates :product_name, presence: true
    validates :product_type, presence: true
    validates :price, presence: true, format: PRICE_REGEX
    validates :sold_status, presence: true, inclusion: { in: @@SOLD_STATUS }
    
    before_destroy :delete_offers
    
    def delete_offers
        offers.each do |offer|
            offer.destroy
        end
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

end