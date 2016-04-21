(function( $ ) {
	
	var RecoveryApi = {};

	RecoveryApi.stem = "/recover";

	RecoveryApi.create = function(successCallback, errorCallback) {
		var params = apiHandler.processForm("email_address");
		apiHandler.doRequest("put", RecoveryApi.stem, params, successCallback, errorCallback);
	};

	RecoveryApi.check = function(userId, recoveryString, successCallback, errorCallback) {
		apiHandler.doRequest("get",
				RecoveryApi.stem +
					"/" + encodeURIComponent(recoveryString) +
					"/" + encodeURIComponent(userId),
				{},
				successCallback,
				errorCallback);
	};

	RecoveryApi.apply = function(successCallback, errorCallback) {
		var params = apiHandler.processForm("user_id", "recovery_string", "recovery_code", "password", "password_confirmation");
		var userId = params.user_id;
			delete params.user_id;
		var recoveryString = params.recovery_string;
			delete params.recovery_string;

		apiHandler.doRequest("post",
			RecoveryApi.stem +
				"/" + encodeURIComponent(recoveryString) +
				"/" + encodeURIComponent(userId),
			params,
			successCallback,
			errorCallback);
	};

	RecoveryApi.remove = function(userId, recoveryString, successCallback, errorCallback) {
		apiHandler.doRequest("delete",
			RecoveryApi.stem +
				"/" + encodeURIComponent(recoveryString) +
				"/" + encodeURIComponent(userId),
			{},
			successCallback,
			errorCallback);
	};

	window.RecoveryApi = RecoveryApi;

})( jQuery );