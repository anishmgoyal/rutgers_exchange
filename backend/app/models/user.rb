class User < ActiveRecord::Base

	# Accessor directives
    attr_accessor :password
	attr_accessible :username, :password, :password_confirmation, :email_address, :phone_number, :first_name, :last_name
    
    # Relations
    has_many :products
    has_many :offers
    has_many :conversations
    
    # Validation
    EMAIL_REGEX = /\A[A-Z0-9._%+-]+@rutgers.edu\z/i
    PHONE_REGEX = /\A[0-9]{10}\z/
	validates :username, :presence => true, :uniqueness => true, :length => { :in => 5..20 }
	validates :email_address, :presence => true, :uniqueness => true, :format => EMAIL_REGEX
	validates :password, :length => { :in => 7..20 }, :confirmation => true, :unless => :encrypted_password?
    validates :first_name, presence: true, :length => { :in => 2..40 }
    validates :last_name, presence: true, :length => { :in => 2..40 }
    validates :phone_number, presence: true, format: PHONE_REGEX
	validates_format_of :username, without: EMAIL_REGEX
	validates_presence_of :password_confirmation, :unless => lambda { |user| user.password.blank? }
	
	# Saving protocols
	before_save :encrypt_password
	after_save :clear_password

	def encrypt_password
		if password.present?
			self.salt = BCrypt::Engine.generate_salt
			self.encrypted_password = BCrypt::Engine.hash_secret(password, salt)
		end
		true
	end
	
	def clear_password
		self.password = nil
		true
	end
    
    def self.authenticate(username="", password="")
		if EMAIL_REGEX.match(username)
			user = User.find_by_email username
		else
			user = User.find_by_username username
		end
		if user && user.match_password(password)
			return user
		else
			return nil
		end
	end
	
	def match_password(password="")
		encrypted_password == BCrypt::Engine.hash_secret(password, salt)
	end

end
