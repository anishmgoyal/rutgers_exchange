module NotificationHelper

	def notify(type, value, user_id=nil, user_id2=nil)
		notification_service = ApplicationService.get :NotificationService
		if user_id
			notification_service.add_notification(user_id, type, value)
		end
		if user_id2
			notification_service.add_notification(user_id2, type, value)
		end
		unless user_id or user_id2
			notification_service.broadcast(type, value)
		end
	end

end