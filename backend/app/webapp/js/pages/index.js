$(document).ready(function() {

	pageLoader.mountPage("/index", function(wnd) {
		var instance = this;
		ProductApi.getProductList(
			function success(apiResponse) {
				$.ajax({
					url: 'pages/index.htm',
					cache: false,
					dataType: 'html',
					success: function(data) {
						wnd.html(data);
						loadPage_index(instance, wnd, apiResponse.products);
					},
					error: function() {
						instance.loadHandler(404);
					}
				});
			}, function error(code) {
				instance.loadHandler(code);
			}
		);
	});
	pageLoader.addAlias("/home", "/index");
	
	function loadPage_index(pageLoader, wnd, products) {
		var i, item;
	
		var sectionTemplate = wnd.find('#sectTemplate1').html();
		var itemTemplate = wnd.find('#productTemplate1').html();

		var recentAdded = $('<section />').html(sectionTemplate);
		recentAdded.find('.template_title').html("Recently Added");
		var recentAddedList = recentAdded.find('.template_list');
		for(i = 0; i < products.length; i++) {
			item = $(itemTemplate);
			var clickFN = (function(id) {
				return function() {
					pageLoader.redirect("/products/view/" + id);
				}
			})(products[i].product_id);
			item.find('.template_image').attr("src", ImageApi.serverImageURL(products[i].thumbnail, ImageApi.PRODUCT));
			item.find('.template_name').text(products[i].product_name);
			item.find('.template_price').text("$" + apiHandler.serverCurrencyToClient(products[i].product_price));
			item.click(clickFN);
			recentAddedList.append(item);
		}
		wnd.append(recentAdded);

		wnd.find('.template').remove();
		pageLoader.notifyDone();
	}

});