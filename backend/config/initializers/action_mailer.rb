ActionMailer::Base.delivery_method = :smtp
ActionMailer::Base.smtp_settings = {
    :address			=>	"smtp.zoho.com",
    :port			=>	465,
    :user_name			=>	"noreply@rutgersxchange.com",
    :domain			=>	"rutgersxchange.com",
    :password			=>	"Notice me senpai!",
    :authentication 		=>	"plain",
    :ssl			=>	true,
    :tls			=>	true,
    :enable_starttls_auto	=>	true
}
