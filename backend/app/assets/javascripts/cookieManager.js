(function() {
	
	var cookieManager = {};

	// Set the preliminary cookie list
	cookieManager.getCookieList = function() {
		// document.cookie="tmp=a; expires=Wed, 28 Jan 2016 17:00:00 UTC";
		var cookieListObj = {};
		var cookieList = document.cookie;
		if(cookieList.length > 0) {
			cookieList = cookieList.split(";");
			for(var i = 0; i < cookieList.length; i++) {
				var cookie = cookieList[i].split("=");
				var key = cookie[0].trim();
				var value = cookie[1].trim();
				cookieListObj[key] = value;
			}
		}
		return cookieListObj;
	};

	cookieManager.setCookie = function(key, value, date) {
		if(arguments.length == 2) {
			date = new Date();
			date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
		}

		var cookieStr = key + "=" + value + "; expires=" + date.toUTCString();
		document.cookie = cookieStr;
	};

	cookieManager.setCookies = function(/*[key, value]...*/) {
		var date = new Date();
		date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
		for(var i = 0, l = arguments.length ; i < l ; i++) {
			var cookie = arguments[i];
			this.setCookie(cookie[0], cookie[1], date);
		}
	};

	// If no cookies are specified, all saved cookies are renewed
	cookieManager.renewCookies = function(/*OPT cookies...*/) {
		var cookieMap = this.getCookieList();
		var cookieList = [];
		var hasProp = cookieMap.hasOwnProperty.bind(cookieMap);

		if(arguments.length == 0) {
			for(var cookie in cookieMap) {
				if(hasProp(cookie)) {
					cookieList.push([cookie, cookieMap[cookie]]);
				}
			}
		} else {
			for(var i = 0, l = arguments.length; i < l; i++) {
				var cookie = arguments[i];
				if(hasProp(cookie)) {
					cookieList.push([cookie, cookieMap[cookie]]);
				}
			}
		}

		this.setCookies.apply(this, cookieList);
	};

	cookieManager.getCookie = function(key) {
		var cookieMap = this.getCookieList();
		return cookieMap[key];
	};

	cookieManager.getCookies = function(/*keys...*/) {
		var cookieMap = this.getCookieList();
		var results = [];
		var push = results.push.bind(results);
		for(var i = 0, l = arguments.length ; i < l ; i++) {
			push(cookieMap[arguments[i]]);
		}
		return results;
	};

	cookieManager.deleteCookie = function(key) {
		var cookieStr = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
		document.cookie = cookieStr;
	};

	cookieManager.deleteCookies = function(/*keys...*/) {
		for(var i = 0, l = arguments.length ; i < l ; i++) {
			this.deleteCookie(arguments[i]);
		}
	};

	cookieManager.deleteAll = function() {
		var cookieList = this.getCookieList();
		var hasProp = cookieList.hasOwnProperty.bind(cookieList);
		for(var cookie in cookieList) {
			if(hasProp(cookie)) {
				this.deleteCookie(cookie);
			}
		}
	};

	// Authentication abstraction

	//TODO: Remove csrfToken from caching.
	cookieManager.saveAuth = function(user_id, username, session_token, csrf_token) {
		this.setCookies(["user_id", user_id], ["username", username], ["session_token", session_token], ["csrf_token", csrf_token]);
	};

	cookieManager.deleteAuth = function() {
		this.deleteCookies("user_id", "username", "session_token", "csrf_token");
	};

	cookieManager.checkAuth = function() {
		var params = this.getCookies("user_id", "username", "session_token", "csrf_token");
		if(typeof params[0] === "undefined" || typeof params[1] === "undefined" || typeof params[2] === "undefined" || typeof params[3] === "undefined")
			return {
				logged_in: false
			};
		else
			return {
				logged_in: true,
				user_id: parseInt(params[0], 10),
				username: params[1],
				session_token: params[2],
				csrf_token: params[3]
			};
	};

	window.cookieManager = cookieManager;

})();
