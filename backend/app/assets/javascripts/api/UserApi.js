(function( $ ) {

	var UserApi = {};

	UserApi.stem = "/users/";

	UserApi.authenticate = function() {

		var params = apiHandler.processForm("username", "password");

		if(params.username.length == 0) params.username = "?";
		params.device_type = "WEB_SHORT_POLL";

		apiHandler.doRequest("put", UserApi.stem + encodeURIComponent(params.username), params, function success(data) {
			pageLoader.setParam("user_id", data["user_id"]);
			pageLoader.setParam("username", params.username);
			pageLoader.setParam("session_token", data["session_token"]);
			pageLoader.setParam("csrf_token", data["csrf_token"]);
			pageLoader.redirect("/index");
			linkHelper.loadState("STATE_AUTH");
			NotificationApi.tick();
		}, function error(code) {
			pageLoader.addError({field: 'global', message: 'Invalid username or password'});
			pageLoader.loadPage("/login");
		});
	};
	
	UserApi.dethenticate = function() {
		var params = apiHandler.requireAuth();
		apiHandler.doRequest("delete", UserApi.stem + encodeURIComponent(params.username), params, function success(data) {

		}, function error(code) {

		});
		pageLoader.removeParam("user_id");
		pageLoader.removeParam("session_token");
		pageLoader.removeParam("csrf_token");
		linkHelper.loadState("STATE_UNAUTH");
	};

	UserApi.register = function(username, email, phone, password, passwordConfirmation) {

		var params = apiHandler.processForm("username", "first_name", "last_name", "email_address", "phone_number", "password", "password_confirmation");

		apiHandler.doRequest("put", UserApi.stem, params, function success(data) {
			if(data.error) {
				for(var i = 0; i < data.errors.length; i++) {
					var error = data.errors[i];
					pageLoader.addError({field: error.field, message: error.message});
				}
				pageLoader.reloadPage((function(params) { return function() {
					for(var param in params) {
						if(params.hasOwnProperty(param) && param.indexOf("password") < 0) {
							$("#" + param).val(params[param]);
						}
					}
				}; })(params));
			} else {
				window.location.hash = "!/register/success";
			}
		}, function error(code) {
			pageLoader.loadHandler(pageLoader.NO_INTERNET);
		});

	};

	UserApi.getUserInformation = function(otherUserId, successCallback, errorCallback) {
		var params = {
			user_id: pageLoader.getParam("user_id"),
			session_token: pageLoader.getParam("session_token"),
			csrf_token: pageLoader.getParam("csrf_token")
		};

		apiHandler.doRequest("get", UserApi.stem + encodeURIComponent(otherUserId), params, successCallback, errorCallback);
	};	

	window.UserApi = UserApi;

})( jQuery );