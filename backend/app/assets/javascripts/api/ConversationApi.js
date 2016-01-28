(function( $ ) {
	
	var ConversationApi = {};

	ConversationApi.stem = "/conversations/";

	ConversationApi.getConversationList = function(successCallback, errorCallback) {
		var params = apiHandler.requireAuth();
		apiHandler.doRequest("get", ConversationApi.stem, params, successCallback, errorCallback);
	};

	ConversationApi.getConversationPage = function(conversationId, page, pageSize, successCallback, errorCallback) {
		var params = {page: page, messages_per_page: pageSize};
		apiHandler.requireAuth(params);
		apiHandler.skipIcon(params);
		apiHandler.doRequest("get", ConversationApi.stem + encodeURIComponent(conversationId), params, successCallback, errorCallback);
	};

	ConversationApi.sendMessage = function(conversationId, message, successCallback, errorCallback) {
		var params = {message: message};
		apiHandler.requireAuth(params);
		apiHandler.skipIcon(params);
		apiHandler.skipRegistry(params);
		apiHandler.doRequest("put", ConversationApi.stem + encodeURIComponent(conversationId), params, successCallback, errorCallback);
	};

	window.ConversationApi = ConversationApi;

})( jQuery );