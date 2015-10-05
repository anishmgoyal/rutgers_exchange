class Message < ActiveRecord::Base

    # Accessor directives
    attr_accessible :message

    # Relations
    belongs_to :conversation
    belongs_to :user
    
    # Validation
    validates :message, presence: true

end