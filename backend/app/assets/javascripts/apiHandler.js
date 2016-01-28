(function( $ ) {

	var ApiHandler = function ApiHandler_constructor(server) {
		if(this.constructor !== ApiHandler_constructor) return new ApiHandler_constructor();
		this.server = server;
		this.activeRequests = [];
		return this;
	};
	ApiHandler.prototype.doRequest = function(method, path, data, successCallback, errorCallback) {
		var instance = this;
		if(method !== "get" && method !== "post") {
			data['_method'] = method;
			method = 'post';
		}
		if(this.hasOwnProperty("loadingIcon") && !data.apiHandlerSkipIcon) this.loadingIcon.show();
		else delete data.apiHandlerSkipIcon;

		var skipRegistry = true;
		if(!data.apiHandlerSkipRegistry) skipRegistry = false;
		else delete data.apiHandlerSkipRegistry;

		var request = $.ajax({
			url: this.server + path,
			data: data,
			method: method,
			datatype: 'json',
			success: function(data) {
				if(instance.hasOwnProperty("loadingIcon")) {
					instance.loadingIcon.hide();
				}
				if(successCallback) successCallback.call(window, data);
			},
			error: function(jqXHR, status) {
				if(instance.hasOwnProperty("loadingIcon")) {
					instance.loadingIcon.hide();
				}
				if(status != "abort") {
					if(errorCallback) errorCallback.call(window, jqXHR.status);
				}
			}
		});

		if(!skipRegistry) this.activeRequests.push(request);

	};
	ApiHandler.prototype.processForm = function(/*String... fieldNames*/) {
		var retval = {};
		for(var i = 0; i < arguments.length; i++) {
			retval[arguments[i]] = $("#" + arguments[i]).val();
		}
		return retval;
	};
	ApiHandler.prototype.requireAuth = function(params) {
		if(typeof params === "undefined") params = {};
		params.user_id = pageLoader.getParam("user_id");
		params.session_token = pageLoader.getParam("session_token");
		params.csrf_token = pageLoader.getParam("csrf_token");
		return params;
	};
	ApiHandler.prototype.skipIcon = function(params) {
		if(typeof params === "undefined") params = {};
		params.apiHandlerSkipIcon = true;
		return params;
	};
	ApiHandler.prototype.skipRegistry = function(params) {
		if(typeof params === "undefined") params = {};
		params.apiHandlerSkipRegistry = true;
		return params;
	};
	ApiHandler.prototype.clientCurrencyToServer = function(price) {
		var priceValidityRegex = /^\$?\d+(,\d{3})*(\.\d{2})?$/;
		var priceExtraStripRegex = /[\$,]/g;

		if(priceValidityRegex.test(price)) {
			var priceAsNum = Number(price.replace(priceExtraStripRegex, ""));
			priceAsNum = priceAsNum * 100;
			return Math.floor(priceAsNum);
		} else {
			return "PRICE_INVAL";
		}
	};
	ApiHandler.prototype.serverCurrencyToClient = function(price) {
		var str_price = (price / 100).toFixed(2);
		var parts = str_price.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return parts.join(".");
	};
	ApiHandler.prototype.setLoadingIcon = function(loadingIcon) {
		this.loadingIcon = loadingIcon;
	};
	ApiHandler.prototype.cancelRunning = function() {
		var reqs = this.activeRequests;
		while(reqs.length > 0) {
			var req = reqs.pop();
			req.abort();
		}
	};

	window.ApiHandler = ApiHandler;
	window.apiHandler = new ApiHandler(window.servers[window.server.mode]);

})( jQuery );