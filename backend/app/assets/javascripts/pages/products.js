$(document).ready(function() {

	var products = {
		_: function(wnd) {
			$.ajax({
				url: "pages/products/index.htm",
				cache: false,
				dataType: 'html',
				success: function(data) {
					wnd.html(data);
					load_page_(wnd);
				},
				error: function() {
					instance.loadHandler(404);
				}
			});
		},
		_view: function(wnd, subpath) {
			var id = subpath.substring(subpath.indexOf("/view") + "/view".length + 1);
			ProductApi.getProduct(id, function success(product) {
				load_page_view(wnd, product, id);
			}, function error(code) {
				pageLoader.notifyDone();
				pageLoader.loadHandler(code);
			});
		},
		_new: function(wnd) {
			$.ajax({
				url: "pages/products/new.htm",
				cache: false,
				dataType: 'html',
				success: function(data) {
					wnd.html(data);
					wnd.find(".show-for-edit").remove();

					$("#product_name").focus();

					var errors = pageLoader.getErrors();
					for(var i = 0; i < errors.length; i++) {
						$("#" + errors[i].field + "_error").html(errors[i].message);
					}
					$('.product-listing-form').submit(function(e) {
						var isPublishNow = (this.goal == "publish-now");
						var redirectAction = (this.goal == "image-upload")? "/products/images/:id" : "/products/view/:id";
						ProductApi.createProduct(isPublishNow, redirectAction);
						if(e.preventDefault) e.preventDefault();
						return false;
					});
					pageLoader.notifyDone();
				},
				error: function() {
					instance.loadHandler(404);
				}
			})
		},
		_edit: function(wnd, subpath) {
			var id = subpath.substring(subpath.indexOf("/edit") + "/edit".length + 1);
			ProductApi.getProduct(id, function success(product) {
				load_page_edit(wnd, product, id);
			}, function error(code) {
				pageLoader.notifyDone();
				pageLoader.loadHandler(code);
			})
		},
		_delete: function(wnd, subpath) {
			var id = subpath.substring(subpath.indexOf("/delete") + "/delete".length + 1);
			var showDeleteConfirmation = false;
			if(subpath.indexOf("/commit") > 0) {
				// Committed? Check for the confirmation boolean
				id = subpath.substring(subpath.indexOf("/commit") + "/commit".length + 1);
				if(pageLoader.getParam("deleteCommit") == id) {
					ProductApi.deleteProduct(id, function success(data) {
						pageLoader.redirect("/products");
					}, function error(code) {
						pageLoader.notifyDone();
						pageLoader.loadHandler(code);
					});
				} else {
					showDeleteConfirmation = true;
				}
			} else {
				showDeleteConfirmation = true;
			}

			if(showDeleteConfirmation) {
				ProductApi.getProduct(id, function success(product) {
					load_page_delete(wnd, product, id);
				}, function error(code) {
					pageLoader.notifyDone();
					pageLoader.loadHandler(code);
				});
			}
		},
		_images: function(wnd, subpath) {
			var id = subpath.substring(subpath.indexOf("/images") + "/images".length + 1);
			ProductApi.getProduct(id, function success(product) {
				load_page_images(wnd, product, id);
			}, function error(code) {
				pageLoader.notifyDone();
				pageLoader.loadHandler(code);
			});
		}
	};

	pageLoader.mountPage("/products", function(wnd) {
		var subpath = pageLoader.getSubPath();
		switch(subpath) {
			case "":
			case "/":
				products._(wnd);
				break;
			case "/new":
				products._new(wnd);
				break;
			default:
				if(subpath.indexOf("/view") == 0)
					products._view(wnd, subpath);
				else if(subpath.indexOf("/edit") == 0)
					products._edit(wnd, subpath);
				else if(subpath.indexOf("/delete") == 0)
					products._delete(wnd, subpath);
				else if (subpath.indexOf("/images") == 0)
					products._images(wnd, subpath);
				else 
					pageLoader.loadHandler(404);
				break;
		}
	});
	
	var load_page_ = function(wnd) {
		var itemTemplate = $('#template_product').html();
		ProductApi.getUserProductList(pageLoader.getParam("username"), function success(data) {
			if(data.products.length > 0) {
				for(var i = 0; i < data.products.length; i++) {
					var itemDiv = $(itemTemplate);
					itemDiv.find(".template_image").text(" ").css("background-image", "url('" + ImageApi.serverThumbnailURL(data.products[i].thumbnail, ImageApi.PRODUCT) + "')");
					itemDiv.find(".template_name").text(data.products[i].product_name);
					if(!data.products[i].is_published) {
						itemDiv.find(".template_name").prepend($('<strong style="color: white">(DRAFT) </strong>'));
					}
					itemDiv.find(".template_created_at").text("Listed on " + data.products[i].created_at);
					itemDiv.find(".template_price").text("$" + apiHandler.serverCurrencyToClient(data.products[i].product_price));
					itemDiv.click((function(id) { return function() {
						pageLoader.redirect("/products/view/" + id);
					} })(data.products[i].product_id));
					$("#product_list_mine").append(itemDiv);
				}
			} else {
				$("#product_list_mine").append("You have no listings currently.");
			}
			pageLoader.notifyDone();
		}, function error(code) {
		
		});
		$('.template').remove();
	};
	
	var load_page_view = function(wnd, product, id) {
	
		var created_at = new Date(product.created_at);
		var date_string = (created_at.getMonth()+1) + "/" + created_at.getDate() + "/" + (created_at.getFullYear() % 100);
	
		$.ajax({
			url: "pages/products/view.htm",
			cache: false,
			dataType: 'html',
			success: function(data) {
				wnd.html(data);

				var product_user_id = product.user.user_id;
				var current_user_id = pageLoader.getParam("user_id");
				
				wnd.find("#template_product_name").text(product.product_name);
				wnd.find("#template_product_price").text(apiHandler.serverCurrencyToClient(product.price));
				wnd.find(".template_product_date").text(date_string);
				wnd.find("#template_product_description").text(product.description);
				
				// Images
				var imageViewer = new ImageViewer({});
				if(product.images.length == 0) {
					product.images.push("notfound.png");
				}
				for(var i = 0; i < product.images.length; i++) {
					imageViewer.addImage(product.images[i]);
				}
				imageViewer.loadComplete();

				// Seller view
				if(product_user_id === current_user_id) {
					wnd.find(".template_show_buyer").remove();
					// Remove draft controls
					if(product.is_published) {
						wnd.find(".product-show-for-draft").remove();
					} else {
						wnd.find(".product-hide-for-draft").remove();
					}

					wnd.find("#template_sv_publish").click(function(id) {
						ProductApi.publishProduct(id, function() {
							pageLoader.reloadPage();
						}, function() {
							pageLoader.reloadPage();
						});
					}.bind(this, id));

					wnd.find("#template_sv_unpublish").click(function(id) {
						ProductApi.unpublishProduct(id, function() {
							pageLoader.reloadPage();
						}, function() {
							pageLoader.reloadPage();
						});
					}.bind(this, id));

					wnd.find("#template_sv_delete").click(function(id) {
						new Dialog({
							confirm: true,
							title: "Remove Listing",
							content: "Are you sure you would like to remove this listing? This action cannot be reversed.",
							wnd: pageLoader.getWnd(),
							offsets: {top: $("#nav")},
							onconfirm: function(id) {
								ProductApi.deleteProduct(id, function() {
									pageLoader.redirect("/products");
								}, function(code) {
									pageLoader.loadHandler(code);
								});
							}.bind(this, id)
						}).show();
					}.bind(this, id));
				}
				// Buyer view
				else {
					wnd.find(".template_show_seller").remove();
					wnd.find("#template_bv_product_usrlink").text(product.user.first_name + " " + product.user.last_name);
				}

				wnd.find(".template_link").each(function() {
					var instance = $(this);
					var curr_attr = instance.attr("href");
					var final_attr = curr_attr.replace(/:user_id/g, product_user_id)
										 .replace(/:product_id/g, id);
					instance.attr("href", final_attr);
				});
				pageLoader.notifyDone();
			},
			error: function() {
				pageLoader.loadHandler(404);
			}
		});
	};

	var load_page_edit = function(wnd, product, id) {

		var current_user_id = pageLoader.getParam("user_id");
		var product_user_id = product.user.user_id;
		if(current_user_id == product_user_id) {
			$.ajax({
				url: "pages/products/new.htm",
				cache: false,
				dataType: "html",
				success: function(wnd, product, id, data) {
					wnd.html(data);
					wnd.find(".show-for-new").remove();

					$("#product_name").focus();
					
					if(product.is_published) {
						wnd.find(".product-show-for-draft").remove();
					} else {
						wnd.find(".product-hide-for-draft").remove();
					}

					var product_name_field = $("#product_name");
					var product_price_field = $("#product_price");
					var product_description_field = $("#description");

					if(product_name_field.val().length == 0 && product_price_field.val().length == 0 && product_description_field.val().length == 0) {
						product_name_field.val(product.product_name);
						product_price_field.val(((product.price / 100).toFixed(2)));
						product_description_field.val(product.description);
					}

					if(product.images.length > 0) {
						var imageTemplate = wnd.find("#template_image_template").html();
						var imagePane = wnd.find("#template_listing_images").html("");

						for(var i = 0; i < product.images.length; i++) {
							var newImg = $(imageTemplate);
							newImg.find(".image-uploader-image").attr("src", ImageApi.serverThumbnailURL(product.images[i], ImageApi.PRODUCT));
							imagePane.append(newImg);
						}
						imagePane.prepend("<div>To change the order of these, or to add/remove images, please click \"Manage Images\" at the bottom of this page.</div>");
					} else {
						wnd.find("#template_listing_images").html("To add images, please click \"Manage Images\" at the bottom of this page.");
					}

					var errors = pageLoader.getErrors();
					for(var i = 0; i < errors.length; i++) {
						$("#" + errors[i].field + "_error").html(errors[i].message);
					}

					var form = $(".product-listing-form");
					form.append($('<input type="hidden" name="product_id" id="product_id" />').val(id));

					form.submit(function(e) {
						var isPublishNow = (this.goal == "publish-now");
						var isRetract = (this.goal == "save-draft");
						var redirectAction = (this.goal == "image-upload")? "/products/images/:id" : "/products/view/:id";
						ProductApi.updateProduct(isPublishNow, isRetract, redirectAction);
						if(e.preventDefault) e.preventDefault();
						return false;
					});

					$(".template_link").each((function(id) {
						return function() {
							$(this).attr("href", $(this).attr("href").replace(/:id/g, id));
						}
					})(id));

					pageLoader.notifyDone();
				}.bind(this, wnd, product, id),
				error: function() {
					pageLoader.loadHandler(404);
				}
			});
		} else {
			pageLoader.loadHandler(473);
		}

	};

	var load_page_delete = function(wnd, product, id) {
		var current_user_id = pageLoader.getParam("user_id");
		var product_user_id = product.user.user_id;
		if(current_user_id == product_user_id) {
			$.ajax({
				url: "pages/products/delete.htm",
				cache: false,
				dataType: "html",
				success: function(data) {
					wnd.html(data);
					$("#template_product_name").text(product.product_name);

					$(".template_link").each(function() {
						var instance = $(this);
						var curr_attr = instance.attr("href");
						var final_attr = curr_attr.replace(/:user_id/g, product_user_id)
											 .replace(/:product_id/g, id);
						instance.attr("href", final_attr);
					});

					$("#commit_link").click(function() {
						pageLoader.setParam("deleteCommit", id);
					});

					pageLoader.notifyDone();
				},
				error: function() {
					pageLoader.loadHandler(404);
				}
			});
		} else {
			pageLoader.loadHandler(473);
		}
	};

	var load_page_images = function(wnd, product, id) {
		var current_user_id = pageLoader.getParam("user_id");
		var product_user_id = product.user.user_id;
		if(current_user_id == product_user_id) {
			$.ajax({
				url: "pages/products/images.htm",
				cache: false,
				dataType: "html",
				success: function(wnd, product, id, data) {
					wnd.html(data);
					wnd.find("#template_product_name").text(product.product_name);

					if(product.is_published) {
						wnd.find(".show-for-draft").remove();
					} else {
						wnd.find(".hide-for-draft").remove();
					}

					var uploader = new ImageUploader({
						elem: wnd.find(".image-uploader-upload-box"),
						form: wnd.find(".image-uploader-form"),
						imagePane: wnd.find(".image-uploader-image-pane"),
						imageTemplate: wnd.find("#template_image_template").html(),
						errorPane: wnd.find(".image-uploader-error"),
						productId: id
					});

					for(var i = 0; i < product.images.length; i++) {
						uploader.addItem(product.images[i]);
					}

					$(".template_link").each((function(id) {
						return function() {
							$(this).attr("href", $(this).attr("href").replace(/:id/g, id));
						}
					})(id));

					var errorHandler = function error(code) {
						pageLoader.loadHandler(code);
					}

					wnd.find("#template-details-button").click(uploader.exportOrder.bind(uploader, function success(id, data) {
						pageLoader.redirect("/products/edit/" + id);
					}.bind(this, id), errorHandler));

					wnd.find("#template-draft-button").click(uploader.exportOrder.bind(uploader, function success(id, errorHandler, data) {
						ProductApi.unpublishProduct(id, function success(data) {
							pageLoader.redirect("/products/view/" + id);
						}, errorHandler);
					}.bind(window, id, errorHandler), errorHandler));

					wnd.find("#template-publish-button").click(uploader.exportOrder.bind(uploader, function success(id, errorHandler, data) {
						ProductApi.publishProduct(id, function success(data) {
							pageLoader.redirect("/products/view/" + id);
						}, errorHandler);
					}.bind(window, id, errorHandler), errorHandler));

					pageLoader.notifyDone();
				}.bind(this, wnd, product, id), error: function() {
					pageLoader.loadHandler(404);
				}
			})
		} else {
			pageLoader.loadHandler(472);
		}
	};

});
