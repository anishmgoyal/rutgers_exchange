// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//

// Libraries

//= require jquery-2.1.1.min
//= require foundation.min

// Configuration

//= require clientConfig
//= require serverConfig

// Frameworks

//= require pageLoader
//= require apiHandler
//= require sidebar

// Handlers

//= require pages/handlers/403
//= require pages/handlers/404
//= require pages/handlers/500
//= require pages/handlers/reset

// Pages

//= require pages/index
//= require pages/login
//= require pages/logout
//= require pages/register
//= require pages/activate
//= require pages/products
//= require pages/profile
//= require pages/offers
//= require pages/messages
//= require pages/debug
//= require pages/search
//= require pages/section
//= require pages/core
//= require pages/info
//= require pages/recover

// Tools

//= require pages/tool/tool-message

// APIs

//= require api/UserApi
//= require api/ProductApi
//= require api/OfferApi
//= require api/ConversationApi
//= require api/NotificationApi
//= require api/ImageApi
//= require api/SearchApi
//= require api/RecoveryApi

// Miscellaneous

//= require animHelper
//= require cookieManager
//= require dialog
//= require imageUploader
//= require imageViewer
//= require loadingIcon
//= require notificationManager
//= require pager
//= require scrollZone
//= require switchPane

// Main Script

//= require main
