class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  
  def reload_service
  	ApplicationService.reload params[:service_name].to_sym
  	render text:"Reloaded #{params[:service_name]}"
  end
  
end
