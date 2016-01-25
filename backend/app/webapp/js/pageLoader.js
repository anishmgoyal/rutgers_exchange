(function( $ ) {

	var wndSelector = '.main-container';

	var PageLoader = function PageLoader_constructor() {
		if(this === window) return new PageLoader();
		this.session = {};
		this.pages = {};
		this.handlers = {};
		this.errors = [];
		this.pageChangeHandlers = [];
		this.addHashListener();
		this.ev = {};
		this.requests = [];
		return this;
	};
	PageLoader.prototype.addHashListener = function() {
		if("onhashchange" in window) {
			var hashChangeListener = (function(pageLoader) {
				return function() {
					// substring to ignore shebang (#!)
					pageLoader.loadPage(pageLoader.getMainPath());
					pageLoader.onPageChange();
				};
			})(this);
			window.addEventListener("hashchange", hashChangeListener, false);
		} else {
			// TODO : handle unsupported browser
			// console.log("This browser is not supported. HashChange event is not supported.");
			window.location = "http://www.rutgersexchange.com/nosupp";
			$(wndSelector).html("This browser is not supported. Please upgrade to the newest version of IE, Edge, Firefox, Chrome, or Safari.");
		}
	};
	PageLoader.prototype.mountPage = function(path, pageScript) {
		this.pages[path] = pageScript;
	};
	PageLoader.prototype.addAlias = function(path, mainPath) {
		this.pages[path] = this.pages[mainPath];
	};
	PageLoader.prototype.mountHandler = function(path, pageScript) {
		this.handlers[path] = pageScript;
	};
	PageLoader.prototype.loadPage = function(path, onload) {
		// Grab the frame
		var wnd = $(wndSelector);
		
		// Clear handlers
		this.ev.onload = onload;
		
		if(typeof this.loadingIcon !== "undefined") {
			this.loadingIcon.show();
		}
		
		if(this.pages.hasOwnProperty(path)) {
			this.pages[path].call(this, wnd);
		} else if(this.handlers.hasOwnProperty(404)) {
			this.handlers[404].call(this, wnd);
		}
	};
	PageLoader.prototype.redirect = function(path) {
		window.location.hash = "!" + path;
	};
	PageLoader.prototype.reloadPage = function(onload) {
		this.loadPage(this.getMainPath(), onload);
		this.onPageChange();
	};
	PageLoader.prototype.reloadForm = function(params, onload) {
		this.reloadPage((function(params) { return function() {
			for(var param in params) {
				if(params.hasOwnProperty(param)) {
					$("#" + param).val(params[param]);
				}
			}
		}; })(params));
	};
	PageLoader.prototype.loadHandler = function(handler, onload) {
		// Grab the frame
		var wnd = $(wndSelector);
		
		// Clear handlers
		this.ev.onload = onload;
		
		if(typeof this.loadingIcon !== "undefined") {
			this.loadingIcon.show();
		}
		
		if(this.handlers.hasOwnProperty(handler)) {
			this.handlers[handler].call(this, wnd);
		} else if(this.handlers.hasOwnProperty(404)) {
			this.handlers[404].call(this, wnd);
		}
	};
	PageLoader.prototype.notifyDone = function() {
		$(window).scrollTop(0);
		this.notifyChange();
		this.errors = [];
		if(typeof this.ev.onload !== "undefined") {
			var wnd = $(wndSelector);
			this.ev.onload(wnd);
		}
		if(typeof this.loadingIcon !== "undefined") {
			this.loadingIcon.hide();
		}
	};
	PageLoader.prototype.notifyDoneWithoutAjax = function() {
		var instance = this;
		setTimeout(function() {
			instance.notifyDone();
		}, 1);
	};
	PageLoader.prototype.notifyChange = function() {
		this.resizeNow();
		$("img").on("load", this.resizeNow.bind(this))
				.on("error", this.resizeNow.bind(this));
		$("a").each(function() {
			$(this).on('click', function(e) {
				if(this.href.substring(this.href.indexOf("#")) === location.hash) {
					//TODO: This doesn't work for some links... why??
					// pageLoader.reloadPage();
				}
			});
		});
	};
	PageLoader.prototype.resizeNow = function() {
		var wrapper = $(window);
		wrapper.trigger('resize');
	};
	PageLoader.prototype.getParam = function(param) {
		if(this.session.hasOwnProperty(param)) return this.session[param];
		else return null;
	};
	PageLoader.prototype.setParam = function(param, value) {
		this.session[param] = value;
	};
	PageLoader.prototype.removeParam = function(param) {
		delete this.session[param];
	};
	PageLoader.prototype.addError = function(error) {
		this.errors.push(error);
	};
	PageLoader.prototype.addErrors = function(errors) {
		for(var i = 0; i < errors.length; i++) {
			var error = errors[i];
			this.addError({field: error.field, message: error.message});
		}
	};
	PageLoader.prototype.getErrors = function() {
		return this.errors;
	};
	PageLoader.prototype.pageChange = function(handler) {
		this.pageChangeHandlers.push(handler);
	};
	PageLoader.prototype.onPageChange = function() {
		for(var i = 0; i < this.pageChangeHandlers.length; i++) {
			this.pageChangeHandlers[i].call(this);
		}
	};
	PageLoader.prototype.getMainPath = function() {
		var hash = window.location.hash.substring(2);
		var index1 = hash.indexOf("/");
		var index2 = hash.substring(index1 + 1).indexOf("/");
		return (index2 > -1)? hash.substring(0, index2 + index1 + 1) : hash;
	};
	PageLoader.prototype.getSubPath = function() {
		var hash = window.location.hash.substring(2);
		var index1 = hash.indexOf("/");
		var index2 = hash.substring(index1 + 1).indexOf("/");
		return (index2 > -1)? hash.substring(index2 + index1 + 1) : "";
	};
	// Icon must contain a "show" and "hide" method that take no args.
	// Further, show may be called multiple times before hide.
	// Caution should be taken when designing a loadingIcon object
	// to ensure that there is protection from multiple show()s
	PageLoader.prototype.setLoadingIcon = function(loadingIcon) {
		this.loadingIcon = loadingIcon;
	};
	PageLoader.prototype.getWnd = function() {
		return $(wndSelector);
	};
	PageLoader.prototype.getTemplate = function(path, callback) {
		while(this.requests.length > 0) {
			var req = this.requests.pop();
			req.abort();
		}
		this.requests.push($.ajax({
			url: "pages/" + path + ".htm",
			dataType: "html",
			cache: false,
			success: function(data) { var wnd = this.getWnd(); wnd.html(data); callback.call(this, wnd) }.bind(this),
			error: function() { this.loadHandler(404); }.bind(this)
		}));
	};

	window.PageLoader = PageLoader;
	window.pageLoader = new PageLoader();
	
	var constants = {
		NO_INTERNET: 1,
		STATUS_OK: 200,
		NOT_FOUND: 404,
		NOT_AUTHENTICATED: 403,
		UNAUTHORIZED: 472
	};
	
	for(var key in Object.keys(constants)) {
		if(constants.hasOwnProperty(key)) {
			pageLoader[key] = constants[key];
		}
	}

})( jQuery );