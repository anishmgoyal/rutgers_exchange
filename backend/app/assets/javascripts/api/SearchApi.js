(function( $ ) {
	
	var SearchApi = {};
	SearchApi.stem = "/search/";

	SearchApi.getResults = function(query, successCallback, errorCallback) {
		apiHandler.doRequest("get", SearchApi.stem, {query: query}, successCallback, errorCallback);
	};

	SearchApi.getResultsWithFilter = function(query, filters, successCallback, errorCallback) {
		filters["query"] = query;
		apiHandler.doRequest("get", SearchApi.stem, filters, successCallback, errorCallback);
	};

	window.SearchApi = SearchApi;

})( jQuery );