(function( $ ) {

	var ProductApi = {};
	
	ProductApi.stem = "/products/";

	ProductApi.condition = {
		CONDITION_NA: "Not Applicable",
		CONDITION_NEW: "New",
		CONDITION_EXCELLENT: "Excellent",
		CONDITION_GOOD: "Good",
		CONDITION_FAIR: "Fair",
		CONDITION_POOR: "Poor",
		CONDITION_FORPARTS: "For Parts"
	};
	
	ProductApi.getProductList = function(successCallback, errorCallback) {
		var params = {products_per_page: 50};
		apiHandler.requireAuth(params);
		apiHandler.doRequest("get", ProductApi.stem, params, successCallback, errorCallback);
	};

	ProductApi.getProductListSect = function (section, page, itemsPerPage, successCallback, errorCallback) {
	    console.log(arguments);
	    var params = { product_type: section, page: page, products_per_page: itemsPerPage, apiHandlerSkipIcon: true };
	    if (section == null) delete params.product_type;
	    apiHandler.doRequest("get", ProductApi.stem, params, successCallback, errorCallback);
	};
	
	ProductApi.getUserProductList = function(username, successCallback, errorCallback) {
		var params = {
			username: username,
			show_drafts: true,
			show_current_user: true,
			products_per_page: 50
		};
		apiHandler.requireAuth(params);
		apiHandler.doRequest("get", ProductApi.stem, params, successCallback, errorCallback);
	};

	ProductApi.getRecentUserProductListWithSold = function(username, successCallback, errorCallback) {
		var params = {
			username: username,
			show_sold: true,
			show_current_user: true,
			products_per_page: 25
		};
		apiHandler.requireAuth(params);
		apiHandler.doRequest("get", ProductApi.stem, params, successCallback, errorCallback);
	};
	
	ProductApi.createProduct = function(isPublishNow, redirectAction) {

		var params = apiHandler.processForm("product_name", "product_type", "product_price", "condition", "description");
		params['user_id'] = pageLoader.getParam("user_id");
		params['session_token'] = pageLoader.getParam("session_token");
		params['csrf_token'] = pageLoader.getParam("csrf_token");
		if(isPublishNow) params['is_published'] = true;

		var priceValidityRegex = /^\$?\d+(,\d{3})*(\.\d{2})?$/;
		var priceExtraStripRegex = /[\$,]/g;

		if(priceValidityRegex.test(params['product_price'])) {
			var priceAsNum = Number(params['product_price'].replace(priceExtraStripRegex, ""));
			priceAsNum = priceAsNum * 100;
			priceAsNum = Math.floor(priceAsNum);
			params.price = priceAsNum;
		} else {
			params.price = "PRICE_INVAL";
		}
		
		apiHandler.doRequest("put", ProductApi.stem, params, function(data) {
			if(data.error) {
				for(var i = 0; i < data.errors.length; i++) {
					var error = data.errors[i];
					pageLoader.addError({field: error.field, message: error.message});
				}
				pageLoader.reloadPage((function(params) { return function() {
					for(var param in params) {
						if(params.hasOwnProperty(param)) {
							$("#" + param).val(params[param]);
						}
					}
				}; })(params));
			} else {
				pageLoader.redirect(redirectAction.replace(/:id/g, data.id));
			}
		}, function(code) {
			pageLoader.loadHandler(pageLoader.NO_INTERNET);
		});
	};

	ProductApi.publishProduct = function(id, successCallback, errorCallback) {
		var params = {is_published: true};
		apiHandler.requireAuth(params);
		apiHandler.doRequest("post", ProductApi.stem + encodeURIComponent(id), params, successCallback, errorCallback);
	};

	ProductApi.unpublishProduct = function(id, successCallback, errorCallback) {
		var params = {is_published: false};
		apiHandler.requireAuth(params);
		apiHandler.doRequest("post", ProductApi.stem + encodeURIComponent(id), params, successCallback, errorCallback);
	};
	
	ProductApi.getProduct = function(id, successCallback, errorCallback) {
		var params = apiHandler.requireAuth();
		apiHandler.doRequest("get", ProductApi.stem + encodeURIComponent(id), params, successCallback, errorCallback);
	};
	
	ProductApi.updateProduct = function(isPublishNow, isRetract, redirectAction) {
	
		var params = apiHandler.processForm("product_id", "product_name", "product_type", "product_price", "condition", "description");
		params['user_id'] = pageLoader.getParam("user_id");
		params['session_token'] = pageLoader.getParam("session_token");
		params['csrf_token'] = pageLoader.getParam("csrf_token");
		params['product_type'] = 'TEXTBOOK';
		if(isPublishNow) params['is_published'] = true;
		else if(isRetract) params['is_published'] = false;

		var priceValidityRegex = /^\$?\d+(,\d{3})*(\.\d{2})?$/;
		var priceExtraStripRegex = /[\$,]/g;

		if(priceValidityRegex.test(params['product_price'])) {
			var priceAsNum = Number(params['product_price'].replace(priceExtraStripRegex, ""));
			priceAsNum = priceAsNum * 100;
			priceAsNum = Math.floor(priceAsNum);
			params.price = priceAsNum;
		} else {
			params.price = "PRICE_INVAL";
		}
		
		apiHandler.doRequest("post", ProductApi.stem + encodeURIComponent(params.product_id), params, function success(data) {
			if(data.error) {
				for(var i = 0; i < data.errors.length; i++) {
					var error = data.errors[i];
					pageLoader.addError({field: error.field, message: error.message});
				}
				pageLoader.reloadPage((function(params) { return function() {
					for(var param in params) {
						if(params.hasOwnProperty(param)) {
							$("#" + param).val(params[param]);
						}
					}
				}; })(params));
			} else {
				pageLoader.redirect(redirectAction.replace(/:id/g, data.id));
			}
		}, function error(code) {
			if(code == 473) {
				// Not permitted
			} else if(code == 403) {
				// Not logged in
			} else if(code == 404) {
				// No product with this id exists
			} else {
				pageLoader.loadHandler(pageLoader.NO_INTERNET);
			}
		});
	
	};

	ProductApi.deleteProduct = function(id, successCallback, errorCallback) {
		var params = apiHandler.requireAuth();
		apiHandler.doRequest("delete", ProductApi.stem + encodeURIComponent(id), params, successCallback, errorCallback);
	};
	
	window.ProductApi = ProductApi;

})( jQuery );