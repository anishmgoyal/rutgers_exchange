(function( $ ) {
	
	pageLoader.mountPage("/search", false, function(wnd) {
		var query = decodeURIComponent(pageLoader.getSubPath().substring(1));
		SearchApi.getResults(query, function success(data) {
			pageLoader.getTemplate("search/index", function(data, wnd) {
				var results = data.results;

				/*for(var i = 0; i < data.length; i++) {
					var result = data[i];
					console.log(result);
					$("#template_search_results").append("<div>Product ID: " + result.product_id + ", Frequency: " + result.total_frequency + "</div>");
				}*/

				var itemTemplate = $("#template_search_result").html();
				var resultList = $("#template_search_results");
				if(results.length > 0) {
					for(i = 0; i < results.length; i++) {
						item = $(itemTemplate);
						var result = results[i];
						var clickFN = (function(id) {
							return function() {
								pageLoader.redirect("/products/view/" + id);
							}
						})(result.product_id);
						item.find('.template_image').attr("src", ImageApi.serverImageURL(result.thumbnail, ImageApi.PRODUCT));
						item.find('.template_name').text(result.product_name);
						item.find('.template_price').text("$" + apiHandler.serverCurrencyToClient(result.product_price));
						item.click(clickFN);
						resultList.append(item);
					}
				} else {
					resultList.append($("<div>We couldn't find any products matching your search. Sorry about that.</div>"));
				}

				$(".template").remove();

				pageLoader.notifyDone();
			}.bind(pageLoader, data));
		}, function error(code) {
			pageLoader.notifyDone();
			pageLoader.loadHandler(code);
		});
	});

})( jQuery );
