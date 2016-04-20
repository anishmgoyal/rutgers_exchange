(function( $ ) {
	
	var OfferApi = {};

	OfferApi.stem = "/offers/";
	OfferApi.stemAccept = "accept/";
	OfferApi.stemComplete = "complete/";

	OfferApi.status = {
		OFFER_OFFERED: "OFFER_OFFERED",
		OFFER_ACCEPTED: "OFFER_ACCEPTED",
		OFFER_COMPLETED: "OFFER_COMPLETED"
	};

	/**
	 * Creates an offer for a product - requires form fields "product_id" and "price" to be present and filled on the current page
	 * successCallback: what to call if the api request has no errors
	 * errorCallback: what to call if the api request has errors
	 */
	OfferApi.createOffer = function() {
		var params = apiHandler.processForm("product_id", "offer_price");
		apiHandler.requireAuth(params);
		params.price = apiHandler.clientCurrencyToServer(params.offer_price);
		apiHandler.doRequest("put", OfferApi.stem, params, function success(data) {
			if(data.error) {
				pageLoader.addErrors(data.errors);
				pageLoader.reloadForm(params);
			} else {
				pageLoader.redirect("/offers/buying");
			}
		}, function error(code) {
			if(code == 471) {
				$("#offer_price").blur();
				OfferApi.getOfferList(true, false, params.product_id, function success(data) {
					var offer = data.offers[0];
					if(offer) {
						var price = apiHandler.serverCurrencyToClient(offer.price);
						new Dialog({
							title: "Offer Exists",
							confirm: true,
							content: "You have already placed an offer of $" + price + " for this listing. " +
									 "Would you like to update that offer?",
							wnd: pageLoader.getWnd(),
							offsets: {top: $("#nav")},
							onconfirm: function(id, price) {
								OfferApi.editOffer(id, price);
							}.bind(window, offer.offer_id, params.offer_price)
						}).show();
					} else {
						pageLoader.loadHandler(404);
					}
				}, function error(code) {
					pageLoader.loadHandler(code);
				});
			} else {
				pageLoader.loadHandler(code);
			}
		});
	};

	/**
	 * Gets a list of offers visible to a user
	 * include_current_user: include offers made by this user towards others
	 * include_other_users: include offers made by others on this user's products
	 * product_id: nullable, if not null restricts results to a given product
	 * successCallback: what to call if the api request has no errors
	 * errorCallback: what to call if the api request has errors
	 */
	OfferApi.getOfferList = function(include_current_user, include_other_users, product_id, successCallback, errorCallback) {
		var params = {
			include_offers_made_by_current_user: include_current_user,
			include_offers_made_by_other_users: include_other_users,
		};
		if(product_id != null) {
			params.product_id = product_id;
		}
		apiHandler.requireAuth(params);
		apiHandler.doRequest("get", OfferApi.stem, params, successCallback, errorCallback);
	};

	/**
	 * Gets more information about an offer than what is available in the list
	 * id: the id of the offer
	 * successCallback: what to call if the api request has no errors
	 * errorCallback: what to call if the api request has errors
	 */
	OfferApi.getOfferDetails = function(id, successCallback, errorCallback) {
		var params = apiHandler.requireAuth();
		apiHandler.doRequest("get", OfferApi.stem + encodeURIComponent(id), params, successCallback, errorCallback);
	};

	/**
	 * Opens a conversation with a potential buyer
	 * id: the id of the offer
	 * successCallback: what to call if the api request has no errors
	 * errorCallback: what to call if the api request has errors
	 */
	OfferApi.acceptOffer = function(id, successCallback, errorCallback) {
		var params = apiHandler.requireAuth();
		apiHandler.doRequest("post", OfferApi.stem + OfferApi.stemAccept + encodeURIComponent(id), params, function success(data) {
			pageLoader.redirect("/messages/" + data.conversation_id);
		}, function error(code) {
			pageLoader.loadHandler(code);
		});
	};

	/**
	 * This rejects an offer, revokes an offer, or backs out of a transaction (buyer or seller can call)
	 * id: the id of the offer
	 * successCallback: what to call if the api request has no errors
	 * errorCallback: what to call if the api request has errors
	 */
	OfferApi.deleteOffer = function(id, successCallback, errorCallback) {
		var params = apiHandler.requireAuth();
		successCallback = (typeof successCallback === "undefined")? pageLoader.reloadPage.bind(pageLoader) : successCallback;
		apiHandler.doRequest("delete", OfferApi.stem + encodeURIComponent(id), params, successCallback, function error(code) {
			pageLoader.loadHandler(code);
		});
	};

	OfferApi.editOffer = function(id, offer_price, successCallback, errorCallback) {
		var params = {
			price: apiHandler.clientCurrencyToServer(offer_price)
		};
		apiHandler.requireAuth(params);
		apiHandler.doRequest("post", OfferApi.stem + encodeURIComponent(id), params, function success(data) {
			if(data.error) {
				pageLoader.addErrors(data.errors);
				pageLoader.reloadForm(params);
			} else {
				pageLoader.redirect("/offers/buying");
			}
		}, function error(code) {
			pageLoader.loadHandler(code);
		});
	};

	OfferApi.updateOffer = function(id) {
		var params = apiHandler.processForm("offer_price");
		apiHandler.requireAuth(params);
		params.price = apiHandler.clientCurrencyToServer(params.offer_price);
		apiHandler.doRequest("post", OfferApi.stem + encodeURIComponent(id), params, function success(data) {
			if(data.error) {
				pageLoader.addErrors(data.errors);
				pageLoader.reloadForm(params);
			} else {
				pageLoader.redirect("/offers/buying");
			}
		}, function error(code) {
			pageLoader.loadHandler(code);
		});
	}

	/**
	 * Marks an offer as finished and purchased, removes listing for the associated product
	 * id: the id of the offer
	 * successCallback: what to call if the api request has no errors
	 * errorCallback: what to call if the api request has errors
	 */
	OfferApi.commitOffer = function(id, successCallback, errorCallback) {
		var params = apiHandler.requireAuth();
		apiHandler.doRequest("post", OfferApi.stem + OfferApi.stemComplete + encodeURIComponent(id), params, successCallback, errorCallback);
	};

	window.OfferApi = OfferApi;

})( jQuery );
