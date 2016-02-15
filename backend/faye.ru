# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment', __FILE__)
run Rails.application

require 'faye'
require Rails.root.join('app', 'faye', 'server_ext.rb')
Faye::WebSocket.load_adapter 'puma'
bayeux = Faye::RackAdapter.new(mount: '/faye', timeout: 25)
bayeux.add_extension(ServerExt.new)
run bayeux
