class ServiceInitializer

	# Load the service classes, and inject them into the Application Service
	Dir[Rails.root.join("app", "services", "*.rb")].each do |file|
		require file
	end
	
	ApplicationService.set :SessionService, SessionService
    ApplicationService.set :NotificationService, WebsockNotificationService
    ApplicationService.alias :NotificationService, :WebsockNotificationService
    ApplicationService.set :SearchService, SearchService

end