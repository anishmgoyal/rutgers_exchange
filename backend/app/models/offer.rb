class Offer < ActiveRecord::Base

    # Accessor directives
    attr_accessible :price
    
    # Relations
    belongs_to :user
    belongs_to :product
    has_one :conversation
    
    # Validation
    PRICE_REGEX = /\A[0-9]{3,}\z/
    validates price, presence: true, format: PRICE_REGEX

end
