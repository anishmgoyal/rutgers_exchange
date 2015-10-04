class Product < ActiveRecord::Base

    # Accessor directives
    attr_accessible :product_name, :product_type, :price

    # Relations
    belongs_to :user
    
    # Validation
    PRICE_REGEX = /\A[0-9]{3,}\z/
    SOLD_STATUS_REGEX = /\A(SOLD_NOT_SOLD|SOLD_IN_TRANSACTION|SOLD_SOLD)\z/
    validates :product_name, presence: true
    validates :product_type, presence: true
    validates :price, presence: true, format: PRICE_REGEX
    validates :sold_status, presence: true, format: SOLD_STATUS_REGEX

end