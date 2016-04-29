(function( $ ) {

	var NotificationManager = function notif_manage_cons(params) {
		if(this.constructor !== notif_manage_cons) return new notif_manage_cons(params);

		this.enabled = true;
		this.notificationList = [];
		this.notificationTemplate = params.notificationTemplate;
		this.timeout = null;
		this.timeToShow = (params.hasOwnProperty("timeToShow"))? params.timeToShow : 3;

		return this;
	};
	NotificationManager.prototype.tryShowNotifications = function() {
		if(!this.enabled) return;
		if(this.notificationList.length == 0) return;
		if(this.timeout != null) return;

		var notification = this.notificationList.shift();
		
		var notifElem = $(this.notificationTemplate);
		notifElem.find(".template_notif_icon").addClass("fi-" + notification.icon);
		notifElem.find(".template_notif_tool_name").text(notification.tool);
		notifElem.find(".template_notif_time").text(notification.time);
		notifElem.find(".template_link").each(function() {
			var instance = $(this);
			var curr_attr = instance.attr("href");
			var final_attr = curr_attr.replace(/:tool_link/g, notification.link);
			instance.attr("href", final_attr);
		});
		notifElem.find(".template_notif_text").html(this.injectLinks(notification.text));

		if(notification.disable) {
			this.enabled = false;
			notifElem.find(".template_block_notifications").remove();
		} else {
			notifElem.find(".template_block_notifications").click(function(notifElem) {
				notifElem.remove();
				if(this.timeout != null) {
					clearTimeout(this.timeout);
					this.timeout = null;
				}
				this.disable();
			}.bind(this, notifElem));
		}

		var notifCloseFn = function(notifElem) {
			notifElem.remove();
			if(this.timeout != null) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			setTimeout(this.tryShowNotifications.bind(this), 100);
		}.bind(this, notifElem);

		notifElem.find(".template_notif_close").click(notifCloseFn);

		$(document.body).append(notifElem);

		this.timeout = setTimeout(notifCloseFn, 1000 * this.timeToShow);

	};

	NotificationManager.prototype.injectLinks = function(str) {
		var ret = "";
		var wrapper = $("<span />");

		var index;
		var stub;

		while((index = str.indexOf("{")) > -1) {
			wrapper.text(str.substring(0, index));
			ret += this.decodeString(wrapper.html());
			str = str.substring(index);

			stub = str.substring(1, str.indexOf("}"));
			ret += this.generateLink(stub.split(":"));
			str = str.substring(str.indexOf("}") + 1);
		}

		wrapper.text(str);
		ret += this.decodeString(wrapper.html());

		return ret;


		/*var matches = str.match(/(\{.+?\})/g);
		var ret = $("<span />").text(str).html();
		var swapped = {};

		if(matches == null) return ret;

		for(var i = 0; i < matches.length; i++) {
			var match = matches[i];

			if(swapped[match]) continue;
			else swapped[match] = true;

			var matchParts = match.substring(1, match.length - 1).split(":");
			var link = this.generateLink(matchParts);
			ret = ret.replace(matches[i], link[0].outerHTML);
		}
		return ret;*/
	};
	NotificationManager.prototype.generateLink = function(params) {
		if(params.length > 0) {
			if(params[0] == "u" || params[0] == "p" || params[0] == "m") {
				if(params.length == 3) {
					var reference = this.decodeString(params[1]);
					var text = this.decodeString(params[2]);
					var uri = (params[0] == "u")? "#!/profile/:reference"
							: (params[0] == "p")? "#!/products/view/:reference"
							: (params[0] == "m")? "#!/messages/:reference" : "";
					uri = uri.replace(":reference", encodeURIComponent(reference));
					var link = $("<a />")
							   .addClass("auto-cap")
							   .addClass("notif-a")
							   .attr("href", uri)
							   .text(text);
					return link[0].outerHTML;
				}
			}
		}
		return '<a href="javascript:void(null);"></a>';
	};

	// Utilities for users and some methods within notificationManager
	NotificationManager.prototype.addNotification = function(notification) {
		this.notificationList.unshift(notification);
		this.tryShowNotifications();
	};

	NotificationManager.prototype.disable = function() {
		// Clear current notifications, and signal that this is the last notification which should be shown
		this.notificationList = [
			{tool: "Notifications", icon: "megaphone", link: "/index", text: "Notifications have been disabled for this tab. To re-enable them, refresh the page.", time: this.currentTimeString(), disable: true}
		];
		this.tryShowNotifications();
	};

	NotificationManager.prototype.currentTimeString = function() {
		var date = new Date();
		var timeStr = date.getHours() % 12;
		if(timeStr == 0) timeStr = "12";
		var minutes = date.getMinutes();
		if(minutes < 10) minutes = "0" + minutes;
		timeStr += ":" + minutes;
		timeStr += (date.getHours() >= 12)? "PM" : "AM";
		return timeStr;
	};

	NotificationManager.prototype.encodeString = function(str) {
		str = str
					.replace("%", "%%")
					.replace("{", "%l")
					.replace("}", "%r")
					.replace(":", "%c");
		return str;
	};
	NotificationManager.prototype.decodeString = function(str) {
		var ret = "";
		for(var i = 0; i < str.length; i++) {
			var c = str.charAt(i);
			if(c == "%") {
				var s = str.charAt(++i);
				ret += (s == "%")? "%" : (s == "l")? "{" : (s == "r")? "}" : (s == "c")? ":" : "";
			} else {
				ret += c;
			}
		}
		return ret;
	};

	$(document).ready(function() {
		window.notificationManager = new NotificationManager({
			notificationTemplate: $("#notificationTemplate").html(),
			timeToShow: 7
		});
		$("#notificationTemplate").remove();
	});

})( jQuery );