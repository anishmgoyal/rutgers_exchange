class ApplicationMailer < ActionMailer::Base
  include ApplicationHelper
  default from: "#{@@APPLICATION_BACKEND_NAME} <noreply@rutgersxchange.com>"
  layout 'mailer'
end
