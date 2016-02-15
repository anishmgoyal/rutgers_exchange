(function( $ ) {

	var UserApi = {};

	UserApi.stem = "/users/";
	UserApi.sessionStem = "/session/";

	UserApi.authenticate = function() {

		var params = apiHandler.processForm("username", "password");

		if(params.username.length == 0) params.username = "?";
		params.device_type = "WEB_SOCKET";

		apiHandler.doRequest("put", UserApi.stem + encodeURIComponent(params.username), params, function success(data) {
			
			// Set the session for pageLoader
			pageLoader.setParam("user_id", data["user_id"]);
			pageLoader.setParam("username", params.username);
			pageLoader.setParam("session_token", data["session_token"]);
			pageLoader.setParam("csrf_token", data["csrf_token"]);

			// Persistent cookies for session
			cookieManager.saveAuth(data["user_id"], params.username, data["session_token"], data["csrf_token"]);

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
		apiHandler.skipIcon(params);
		apiHandler.skipRegistry(params);
		apiHandler.doRequest("delete", UserApi.stem + encodeURIComponent(params.username), params, function success(data) {
			// So... what?
		}, function error(code) {
			// Can't really do anything... session was probably invalid to begin with
		});
		
		// Remove the session from the pageLoader framework
		pageLoader.removeParam("user_id");
		pageLoader.removeParam("username");
		pageLoader.removeParam("session_token");
		pageLoader.removeParam("csrf_token");

		// Remove cookies for session
		cookieManager.deleteAuth();

		linkHelper.loadState("STATE_UNAUTH");
	};

	UserApi.verifySession = function(user_id, session_token, csrf_token, successCallback, errorCallback) {
		var params = apiHandler.blockingCall({
			user_id: user_id,
			session_token: session_token,
			csrf_token: csrf_token
		});
		apiHandler.doRequest("get", UserApi.sessionStem + encodeURIComponent("verify"), params, successCallback, errorCallback);
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
				messageTool.loadMessage(
					pageLoader.getWnd(),
					"Account Created Successfully",
					"We've sent an email to the address you gave us. Please click the link in that email to activate your account and log in for the first time. " +
					"Click <a href='#!/index'>here</a> to go back to the main page."
				);
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