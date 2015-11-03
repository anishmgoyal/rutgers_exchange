class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  
  before_filter :disable_cors
  
  def disable_cors
	headers['Access-Control-Allow-Origin'] = '*'
	headers['Access-Control-Allow-Methods'] = 'POST, PUT, DELETE, GET, OPTIONS'
	headers['Access-Control-Request-Method'] = '*'
	headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  end
  
end
