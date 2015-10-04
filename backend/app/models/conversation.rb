class Conversation < ActiveRecord::Base
    
    # Relations
    belongs_to :buyer, class_name: "User", foreign_key: "buyer_id"
    belongs_to :seller, class_name: "User", foreign_key: "seller_id"
    belongs_to :offer
    has_many :messages
    
    before_destroy :delete_messages
    
    def delete_messages
        self.messages.each do |message|
            message.destroy
        end
    end

end
