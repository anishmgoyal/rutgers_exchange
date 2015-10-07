class Offer < ActiveRecord::Base

    # Accessor directives
    attr_accessible :price, :offer_status
    
    # Relations
    belongs_to :user
    belongs_to :product
    has_one :conversation
    
    # Constants
    @@OFFER_OFFERED = "OFFER_OFFERED"
    @@OFFER_ACCEPTED = "OFFER_ACCEPTED"
    @@OFFER_COMPLETED = "OFFER_COMPLETED"
    @@OFFER_STATUS = [@@OFFER_OFFERED, @@OFFER_ACCEPTED, @@OFFER_COMPLETED]
    
    # Validation
    PRICE_REGEX = /\A[0-9]{3,}\z/
    validates :price, presence: true, format: PRICE_REGEX
    validates :offer_status, presence: true, in: @@OFFER_STATUS
    
    before_destroy :reset_product_status
    before_destroy :delete_conversation
    
    def reset_product_status
        self.product.sold_status = "SOLD_NOT_SOLD"
    end
    
    def delete_conversation
        self.conversation.destroy
    end
    
    def offer_status
        read_attribute :offer_status
    end

end
