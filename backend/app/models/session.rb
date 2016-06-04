class Session < ActiveRecord::Base

	require 'securerandom'

	# Accessor directives
	attr_accessible :user_id, :user_agent, :device_notification_type

	# Relations
	belongs_to :user

	# Static Fields
	@@SESSION_VALID = :SESSION_VALID
	@@SESSION_AUTH_ERR = :SESSION_AUTH_ERR
	@@SESSION_EXPIRED = :SESSION_EXPIRED
	@@SESSION_NO_EXIST = :SESSION_NO_EXIST
	@@SESSION_DELETED = :SESSION_DELETED

	# Saving protocols
	before_create :set_tokens

	def set_tokens
		self.session_token = SecureRandom.uuid # Set once then loop till unique
		self.session_token = SecureRandom.uuid while Session.where(session_token: session_token).count > 0
		self.csrf_token = SecureRandom.hex 64
	end

	def self.SESSION_VALID
		@@SESSION_VALID
	end

	def self.SESSION_AUTH_ERR
		@@SESSION_AUTH_ERR
	end

	def self.SESSION_EXPIRED
		@@SESSION_EXPIRED
	end

	def self.SESSION_NO_EXIST
		@@SESSION_NO_EXIST
	end

	def self.SESSION_DELETED
		@@SESSION_DELETED
	end

end
