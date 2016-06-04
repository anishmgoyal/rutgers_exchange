# This runs the faye server

# Get Rails-Specific Stuff
require ::File.expand_path('../config/environment', __FILE__)

# Faye specific imports
require 'faye'
require 'faye/websocket'
require Rails.root.join('app', 'faye', 'server_ext.rb')

# Start the faye server
faye_server = Faye::RackAdapter.new(mount: '/faye', timeout: 30)
faye_server.add_extension(ServerExt.new)
run faye_server