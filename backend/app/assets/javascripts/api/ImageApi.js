(function( $ ) {
	
	var ImageApi = {};

	ImageApi.stem = "/image/";
	ImageApi.PRODUCT = "product/";
	ImageApi.STATUS = "status/";

	ImageApi.upload = function(productId, form, imageType, successCallback, errorCallback) {
		// Ensure that we have a json wrapper as well as the form
		var $form = $(form);
		form = $form[0];

		// Authentication is required, so fill the authorization parameters
		// If the fields do not exist, create them
		var fields = {
			_method: $form.find("#_method"),
			product_id: $form.find("#product_id")
		};
		var values = {
			_method: "put",
			product_id: productId
		};

		// These may be subject to change as time goes on
		var authParams = apiHandler.requireAuth();

		for(var authParam in authParams) {
			if(authParams.hasOwnProperty(authParam)) {
				fields[authParam] = $form.find("#" + authParam);
				values[authParam] = authParams[authParam];
			}
		}

		for(var field in fields) {
			if(fields.hasOwnProperty(field)) {
				if(fields[field].length == 0) {
					fields[field] = $('<input type="hidden" id="' + field +'" name="' + field + '" />');
					$form.append(fields[field]);
				}
				fields[field].val(values[field]);
			}
		}

		// Set form target, etc
		var form_target_id = "upload_frame_" + (new Date().getTime());
		form.action = apiHandler.server + ImageApi.stem + imageType;
		form.method = "post";
		form.target = form_target_id;

		// Create the target iframe
		var target = $('<iframe name="' + form_target_id + '" id="' + form_target_id + '" style="display: none;" />');
		pageLoader.getWnd().append(target);

		// Bind the iframe load event to handle the server response
		target.load(function(successCallback, errorCallback) {
			try {
				var response = JSON.parse(this.contents().find("body").text());
				if(response.status == 200) {
					successCallback(response);
				} else {
					errorCallback(response.status, response);
				}
			} catch(e) {
				// Some sort of unexpected error occurred.
				errorCallback(500, "Unexpected upload error.");
			}

			this.remove();
		}.bind(target, successCallback, errorCallback));

		// The "apiHandler.doRequest" call for this workaround
		form.submit();
	};

	ImageApi.setOrdinals = function(ordinalMap, imageType, successCallback, errorCallback) {
		var params = {ordinal_map: ordinalMap};
		apiHandler.requireAuth(params);
		apiHandler.doRequest("post", ImageApi.stem + imageType, params, successCallback, errorCallback);
	};

	// Only for if the webapp is not on the same server as the api
	ImageApi.getResponse = function(responseId, successCallback, errorCallback) {
		var params = apiHandler.requireAuth();
		apiHandler.doRequest("get", ImageApi.stem + ImageApi.STATUS + encodeURIComponent(responseId), params, successCallback, errorCallback);
	};

	ImageApi.serverImageURL = function(id, imageType) {
		return apiHandler.server + "assets/" + id;
	};

	ImageApi.serverThumbnailURL = function(id, imageType) {
		return apiHandler.server + "assets/" + id + "t";
	};

	ImageApi.deleteImage = function(id, imageType, successCallback, errorCallback) {
		var params = apiHandler.requireAuth();
		apiHandler.skipIcon(params);
		apiHandler.skipRegistry(params);
		apiHandler.doRequest("delete", ImageApi.stem + imageType + encodeURIComponent(id), params, successCallback, errorCallback);
	};

	window.ImageApi = ImageApi;

})( jQuery );
