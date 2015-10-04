class Offer < ActiveRecord::Base

    # Accessor directives
    attr_accessible :price
    
    # Relations
    belongs_to :user
    belongs_to :product
    has_one :conversation
    
    # Validation
    PRICE_REGEX = /\A[0-9]{3,}\z/
    STATUS_REGEX = /\A(OFFER_OFFERED|OFFER_ACCEPTED|OFFER_COMPLETED)\z/
    validates :price, presence: true, format: PRICE_REGEX
    validates :status, presence: true, format: STATUS_REGEX
    
    before_destroy :reset_product_status
    before_destroy :delete_conversation
    
    def reset_product_status
        self.product.sold_status = "SOLD_NOT_SOLD"
    end
    
    def delete_conversation
        self.conversation.destroy
    end

end
