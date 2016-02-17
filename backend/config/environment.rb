# Load the Rails application.
require File.expand_path('../application', __FILE__)

ActionMailer::Base.delivery_method = :smtp
ActionMailer::Base.smtp_settings = {
    :address			=>	"smtp.zoho.com",
    :port			=>	465,
    :username			=>	"noreply@rutgersxchange.com",
    :domain			=>	"rutgersxchange.com",
    :password			=>	"Notice me senpai!",
    :authentication 		=>	"plain",
    :ssl			=>	true,
    :tls			=>	true,
    :enable_startttls_auto	=>	true
}

# Initialize the Rails application.
Rails.application.initialize!
