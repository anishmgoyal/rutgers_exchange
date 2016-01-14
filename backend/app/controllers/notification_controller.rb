class NotificationController < ApplicationController

	include SessionsHelper

	before_filter :require_auth

	def list
		notification_response = ApplicationService.get(:NotificationService).get_notifications(params[:session_token], 1)
		render status: 200, json: notification_response
	end

end
