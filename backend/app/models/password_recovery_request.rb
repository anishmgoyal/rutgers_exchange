class PasswordRecoveryRequest < ActiveRecord::Base

	require 'securerandom'

	# Accessor directives
	attr_accessor :user_id
	attr_accessible :user_id

	# Relations
	belongs_to :user
	before_save :set_info

	def set_info
		self.recovery_string = SecureRandom.base64(48)
		self.recovery_code = SecureRandom.hex(3).to_s.upcase
	end

end
