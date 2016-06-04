# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment', __FILE__)
# run Rails.application

require Rails.root.join('app', 'services', 'application_service.rb')
require Rails.root.join('config', 'initializers', 'service_initializer.rb')
ServiceInitializer.init

run Rails.application