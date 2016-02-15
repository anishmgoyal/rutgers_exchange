# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment', __FILE__)
# run Rails.application

require 'faye'
require 'faye/websocket'
require Rails.root.join('app', 'faye', 'server_ext.rb')

bayeux = Faye::RackAdapter.new(mount: '/faye', timeout: 25)
bayeux.add_extension(ServerExt.new)

class Backend
    def initialize(app, faye)
        @app = app
	@faye = faye
    end
    def call(env)
        if env["PATH_INFO"].starts_with? "/faye" #Faye::WebSocket.websocket?(env)
	    @faye.call(env)
	else
	    @app.call(env)
	end
    end
end

back = Backend.new(Rails.application, bayeux)
run back
