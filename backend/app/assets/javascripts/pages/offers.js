$(document).ready(function() {

	var offers = {
		_: function(wnd) {
			OfferApi.getOfferList(true, true, null, function success(data) {
				load_page_(wnd, data.offers);
			}, function error(code) {
				pageLoader.loadHandler(code);
			});
		},
		_new: function(wnd, subpath) {
			subpath = subpath.substring(subpath.indexOf("/new") + "/new".length + 1);
			var idLength = subpath.indexOf("/");
			var id = subpath.substring(0, idLength);
			var pref = subpath.substring(idLength + 1);
			ProductApi.getProduct(id, function success(data) {
				load_page_new(wnd, data, id, pref);
			}, function error(code) {
				pageLoader.loadHandler(code);
			});
		},
		_edit: function(wnd, subpath) {
			var id = subpath.substring(subpath.indexOf("/edit") + "/edit".length + 1);
			OfferApi.getOfferDetails(id, function success(data) {
				load_page_edit(wnd, data, id);
			}, function error(code) {
				pageLoader.loadHandler(code);
			});
		}
	};

	pageLoader.mountPage("/offers", function(wnd) {
		var subpath = pageLoader.getSubPath();
		switch(subpath) {
			case "":
			case "/":
				offers._(wnd);
				break;
			default:
				if (subpath.indexOf("/new") == 0)
					offers._new(wnd, subpath);
				else if (subpath.indexOf("/edit") == 0)
					offers._edit(wnd, subpath);
				else
					pageLoader.loadHandler(404);
				break;
		}
	});

	var load_page_ = function(wnd, offers) {
		$.ajax({
			url: "pages/offers/index.htm",
			cache: false,
			dataType: 'html',
			success: function(data) {
				wnd.html(data);
				var sp = new SwitchPane(wnd.find("#offer_switch_pane"));
				
				var sp_buying = sp.elem.find("#switch_pane_buying");
				var sp_selling = sp.elem.find("#switch_pane_selling");

				var template_product_header = wnd.find("#template_product_header").html();
				var template_offer_row = wnd.find("#template_offer_row").html();

				var current_user_id = pageLoader.getParam("user_id");

				var num_as_seller = 0;
				var num_as_buyer = 0;

				var seller_prod_panes = {};
				var buyer_prod_panes = {};

				var revokeFn = (function() {
					new Dialog({
						confirm: true,
						content: 'Are you sure you want to revoke this offer? This cannot be undone.',
						deleteOnHide: true,
						title: 'Confirm',
						wnd: pageLoader.getWnd(),
						onconfirm: function() {
							OfferApi.deleteOffer(offer_id);
						},
						offsets: {top: $('#nav')}
					}).show();
				}).toString().replace(/[\r\n]/g, ' ');

				var rejectFn = revokeFn.replace(/revoke/g, "reject");

				var acceptFn = function() {
					new Dialog({
						confirm: true,
						content: 'Are you sure you would like to accept the offer of $:offer_price?',
						deleteOnHide: true,
						title: 'Confirm',
						wnd: pageLoader.getWnd(),
						onconfirm: function() {
							OfferApi.acceptOffer(offer_id);
						},
						offsets: {top: $('#nav')}
					}).show();
				}.toString().replace(/[\r\n]/g, ' ');

				for(var i = 0; i < offers.length; i++) {
					var offer = offers[i];
					if(offer.product.user.user_id == current_user_id) {
						// Add to seller tab
						if(num_as_seller ++ == 0) sp_selling.html("");
						var seller_prod_pane = seller_prod_panes[offer.product.product_id];
						var view_all = null;

						if(typeof seller_prod_pane === "undefined") {
							seller_prod_pane = $(template_product_header);
							seller_prod_pane.find(".template_image").text(" ").css("background-image", "url('" + ImageApi.serverThumbnailURL(offer.product.thumbnail, ImageApi.PRODUCT) + "')");
							seller_prod_pane.find(".template_name").html(offer.product.product_name);
							seller_prod_pane.find(".template_price").html(apiHandler.serverCurrencyToClient(offer.product.product_price));
							seller_prod_pane.find(".show_for_buyer").remove();
							sp_selling.append(seller_prod_pane);

							view_all = $("<div />");

							seller_prod_panes[offer.product.product_id] = {
								pane: seller_prod_pane,
								max: offer.price,
								num_offers: 1,
								id: offer.offer_id,
								view_all: view_all
							};
							seller_prod_pane.find(".num_offers").html("1");
							seller_prod_pane.find(".template_offer_max_price").html(apiHandler.serverCurrencyToClient(offer.price));
						} else {
							view_all = seller_prod_pane.view_all;
							seller_prod_pane.num_offers++;
							if(offer.price > seller_prod_pane.max) {
								seller_prod_pane.id = offer.offer_id;
								seller_prod_pane.max = offer.price;
								seller_prod_pane.pane.find(".num_offers").html(seller_prod_pane.num_offers);
								seller_prod_pane.pane.find(".num_offers_plural").html("s");
								seller_prod_pane.pane.find(".template_offer_max_price").html(apiHandler.serverCurrencyToClient(offer.price));
							}
							seller_prod_pane = seller_prod_pane.pane;
						}

						if(offer.offer_status == OfferApi.status.OFFER_ACCEPTED) {
							seller_prod_pane.find('.hide-for-accepted').hide();
						}

						var view_all_row = $(template_offer_row);
						view_all_row.find(".template_offer_price").html(apiHandler.serverCurrencyToClient(offer.price));
						view_all_row.find(".template_seller_name").html(offer.user.first_name + " " + offer.user.last_name);
						view_all_row.find(".template_offer_date").html(offer.created_at);
						if(offer.offer_status != OfferApi.status.OFFER_OFFERED) {
							view_all_row.find('.template_accept_link').remove();
							view_all_row.find('.template_conversation_link').css("display", "inline-block");
							view_all_row.find('.template_link').each(function() {
								var instance = $(this);
								var curr_attr = instance.attr("href");
								var final_attr = curr_attr.replace(/:conversation_id/g, offer.conversation.id);
								instance.attr("href", final_attr);
							});
						} else {
							var acceptCurrFn = acceptFn
									.replace(/offer_id/g, offer.offer_id)
									.replace(/:offer_price/g, apiHandler.serverCurrencyToClient(offer.price));
							view_all_row.find('.template_accept_link').attr("onclick", "(" + acceptCurrFn + ")()");
						}
						view_all_row.find('.template_reject_link').attr("onclick", "(" + rejectFn.replace(/offer_id/g, offer.offer_id) + ")()");
						view_all.append(view_all_row);

						seller_prod_pane.find('.template_link').each(function() {
							var instance = $(this);
							var curr_attr = instance.attr("href");
							var final_attr = curr_attr.replace(/:offer_id/g, offer.offer_id)
													  .replace(/:product_id/g, offer.product.product_id)
													  .replace(/:user_id/g, offer.user.user_id);
							instance.attr("href", final_attr);
						});

					} else {
						// Add to buyer tab
						if(num_as_buyer ++ == 0) sp_buying.html("");

						var buyer_prod_pane = $(template_product_header);
						buyer_prod_pane.find(".template_image").text(" ").css("background-image", "url('" + ImageApi.serverThumbnailURL(offer.product.thumbnail, ImageApi.PRODUCT) + "')");
						buyer_prod_pane.find(".template_name").html(offer.product.product_name);
						buyer_prod_pane.find(".template_price").html(apiHandler.serverCurrencyToClient(offer.product.product_price));
						buyer_prod_pane.find(".template_offer_price").html(apiHandler.serverCurrencyToClient(offer.price));
						buyer_prod_pane.find(".show_for_seller").remove();
						sp_buying.append(buyer_prod_pane);
						buyer_prod_panes[offer.product.product_id] = buyer_prod_pane;

						buyer_prod_pane.find('.template_link').each(function() {
							var instance = $(this);
							var curr_attr = instance.attr("href");
							var final_attr = curr_attr.replace(/:offer_id/g, offer.offer_id)
													  .replace(/:product_id/g, offer.product.product_id);
							instance.attr("href", final_attr);
						});

						var buyerRevokeFn = revokeFn.replace(/offer_id/g, offer.offer_id);

						buyer_prod_pane.find('.template_revoke_link').attr("onclick", "(" + buyerRevokeFn + ")()");
					}
				}

				for(var param in seller_prod_panes) {
					if(seller_prod_panes.hasOwnProperty(param)) {
						var seller_prod_pane = seller_prod_panes[param];
						
						var acceptTopFn = acceptFn
						 .replace(/offer_id/g, seller_prod_pane.id)
						 .replace(/:offer_price/g, apiHandler.serverCurrencyToClient(seller_prod_pane.max));

						seller_prod_pane.pane.find(".template_accept_link").attr("onclick", "(" + acceptTopFn + ")()");

						var content = seller_prod_pane.view_all.html().replace(/"/g, '\\"');
						content = content.replace(/\n/g, " ");
						content = '"' + content + '"';

						var listFn = function() {
							new Dialog({
								content: view_all,
								deleteOnHide: true,
								height: 500,
								title: 'View Offers',
								wnd: pageLoader.getWnd(),
								offsets: {top: $('#nav')}
							}).show();
						}.toString().replace(/view_all/g, content);

						seller_prod_pane.pane.find(".template_viewall_link").attr("onclick", "(" + listFn + ")()");
					}
				}

				// Force switch pane tool to reload the pane
				sp.swapTo(sp_buying);

				wnd.find(".template").remove();
				pageLoader.notifyDone();
			},
			error: function() {
				pageLoader.notifyDone();
				pageLoader.loadHandler(404);
			}
		})
	};

	var load_page_new = function(wnd, product, id, pref) {
		$.ajax({
			url: "pages/offers/new.htm",
			cache: false,
			dataType: 'html',
			success: function(data) {
				wnd.html(data);
				var price_str = apiHandler.serverCurrencyToClient(product.price);
				$("#product_id").val(product.product_id);
				$("#template_product_name").html(product.product_name);
				$("#template_price").html(price_str);

				if(pref == "same") {
					$("#offer_price").val(price_str);
				}

				$(".template_link").each(function() {
					var current_attr = $(this).attr("href");
					var final_attr = current_attr.replace(/:product_id/g, id);
					$(this).attr("href", final_attr);
				});

				var errors = pageLoader.getErrors();
				for(var i = 0; i < errors.length; i++) {
					$("#" + errors[i].field + "_error").html(errors[i].message);
				}

				$("#offer-form").submit(function(e) {
					OfferApi.createOffer();
					if(e.preventDefault) e.preventDefault();
					return false;
				})
				pageLoader.notifyDone();
			},
			error: function() {
				pageLoader.loadHandler(404);
			}
		});
	};

	var load_page_edit = function(wnd, offer, id) {
		$.ajax({
			url: "pages/offers/new.htm",
			cache: false,
			dataType: 'html',
			success: function(data) {
				wnd.html(data);

				var price_str = apiHandler.serverCurrencyToClient(offer.product.price);
				$("#product_id").val(offer.product.product_id);
				$("#template_product_name").html(offer.product.product_name);
				$("#template_price").html(price_str);

				$("#template_submit").html("Update Offer");
				$("#template_cancel").attr("href", "#!/offers");

				$("#offer_price").val(apiHandler.serverCurrencyToClient(offer.price));

				$(".template_link").each(function() {
					var current_attr = $(this).attr("href");
					var final_attr = current_attr.replace(/:product_id/g, offer.product.product_id);
					$(this).attr("href", final_attr);
				});

				var errors = pageLoader.getErrors();
				for(var i = 0; i < errors.length; i++) {
					$("#" + errors[i].field + "_error").html(errors[i].message);
				}

				$("#offer-form").submit(function(e) {
					OfferApi.updateOffer(id);
					if(e.preventDefault) e.preventDefault();
					return false;
				})
				pageLoader.notifyDone();
			},
			error: function() {
				pageLoader.loadHandler(404);
			}
		});
	};

});
