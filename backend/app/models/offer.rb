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
    PRICE_REGEX = /\A[0-9]+\z/
    validates :price, presence: true, format: PRICE_REGEX, numericality: {greater_than_or_equal_to: 0}
    validates :offer_status, presence: true, inclusion: { in: @@OFFER_STATUS }
    
    before_destroy :reset_product_status
    before_destroy :delete_conversation
    
    def reset_product_status
        self.product.sold_status = "SOLD_NOT_SOLD"
    end
    
    def delete_conversation
        self.conversation.destroy if self.conversation
    end
    
    def offer_status
        read_attribute :offer_status
    end

    # Static Accessors
    def self.OFFER_OFFERED
        @@OFFER_OFFERED
    end

    def self.OFFER_ACCEPTED
        @@OFFER_ACCEPTED
    end

    def self.OFFER_COMPLETED
        @@OFFER_COMPLETED
    end

end
