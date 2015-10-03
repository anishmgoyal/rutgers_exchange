class User < ActiveRecord::Base

	# Accessor directives
	attr_accessible :username, :password, :confirm_password, :email_address, :phone_number
    
    # Validation
    EMAIL_REGEX = /\A[A-Z0-9._%+-]+@rutgers.edu\z/i
	validates :username, :presence => true, :uniqueness => true, :length => { :in => 5..20 }
	validates :email, :presence => true, :uniqueness => true, :format => EMAIL_REGEX
	validates :password, :length => { :in => 7..20 }, :confirmation => true, :unless => :encrypted_password?
	validates_format_of :username, without: EMAIL_REGEX
	
	# Saving protocols
	before_save :encrypt_password
	after_save :clear_password

	def encrypt_password
		if password.present?
			self.salt = BCrypt::Engine.generate_salt
			self.encrypted_password = BCrypt::Engine.hash_secret(password, salt)
		end
	end
	
	def clear_password
		self.password = nil
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
