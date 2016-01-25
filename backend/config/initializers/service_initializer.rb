class ServiceInitializer

	# Load the service classes, and inject them into the Application Service
	Dir[Rails.root.join("app", "services", "*.rb")].each do |file|
		require file
	end
	
	ApplicationService.set :SessionService, SessionService
    ApplicationService.set :NotificationService, NotificationService
    ApplicationService.set :SearchService, SearchService

end