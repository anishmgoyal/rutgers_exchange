(function( $ ) {

	var NotificationManager = function notif_manage_cons(params) {
		if(this.constructor !== notif_manage_cons) return new notif_manage_cons(params);

		this.enabled = true;
		this.notificationList = [];
		this.mobileNotificationList = [];
		this.notificationTemplate = params.notificationTemplate;
		this.mobileNotificationTemplate = params.mobileNotificationTemplate;
		this.unreadMobileNotificationCount = 0;
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
	NotificationManager.prototype.renderMobileNotifications = function() {
		var notifications = $("<div class='template_holds_mobile_notifications' />");

		var foundUnread = false;

		this.unreadMobileNotificationCount = 0;
		$("#notif-megahorn-badge").html("");

		if(this.mobileNotifDialog) {
			this.mobileNotifDialog.hide();
			delete this.mobileNotifDialog;
		}

		if(this.mobileNotificationList.length == 0) {
			notifications.append("<div class='no_notifs' style='text-align: center'>You have no notifications</div>");
			this.mobileNotifDialog = new Dialog({
				content: notifications,
				contentIsElem: true,
				deleteOnHide: true,
				height: 500,
				title: "Notifications",
				wnd: pageLoader.getWnd(),
				onhide: this.onMobileNotifDialogClose.bind(this),
				offsets: {top: $("#nav")}
			}).show();
		} else {
			for(var i = 0; i < this.mobileNotificationList.length; i++) {
				var notification = this.mobileNotificationList[i];
				var notifElem = $(this.mobileNotificationTemplate);

				if(i == 0) {
					notifElem.addClass("popup-row-first");
				}
				if(!notification.hasOwnProperty("read")) {
					notification.read = true;
					notifElem.addClass("popup-row-unread");
					notifElem.find(".template_notif_modifier").html("NEW");
				} else if(!foundUnread) {
					foundUnread = true;
				}

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
				notifications.append(notifElem);
			}

			this.mobileNotifDialog = new Dialog({
				content: notifications,
				contentIsElem: true,
				deleteOnHide: true,
				height: 500,
				title: 'Notifications',
				wnd: pageLoader.getWnd(),
				onhide: this.onMobileNotifDialogClose.bind(this),
				offsets: {top: $('#nav')}
			}).show();
		}
	};

	NotificationManager.prototype.onMobileNotifDialogClose = function() {
		delete this.mobileNotifDialog;
		if(this.mobileCloseHandler) this.mobileCloseHandler.call(window);
	};

	NotificationManager.prototype.tryShowMobileNotification = function(notification) {
		if(this.mobileNotifDialog) {

			notification.read = true;

			var notifications = this.mobileNotifDialog.pane.find(".template_holds_mobile_notifications");
			notifications.find(".no_notifs").remove();
			notifications.find(".popup-row-first").removeClass("popup-row-first");

			var notifElem = $(this.mobileNotificationTemplate);
			notifElem.addClass("popup-row-first").addClass("popup-row-unread");

			notifElem.find(".template_notif_modifier").html("NEW");
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
			notifications.prepend(notifElem);
		} else {
			this.unreadMobileNotificationCount++;
			$("#notif-megahorn-badge").text(this.unreadMobileNotificationCount);
		}
	}

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
	};
	NotificationManager.prototype.generateLink = function(params) {
		if(params.length > 0) {
			if(params[0] == "u" || params[0] == "p" || params[0] == "m" || params[0] == "m_") {
				if(params.length == 3) {
					var reference = this.decodeString(params[1]);
					var text = this.decodeString(params[2]);
					var uri = (params[0] == "u")? "#!/profile/:reference"
							: (params[0] == "p")? "#!/products/view/:reference"
							: (params[0] == "m")? "#!/messages/:reference"
 							: (params[0] == "m_")? "#!/messages/:reference" : "";
					uri = uri.replace(":reference", encodeURIComponent(reference));
					var link = $("<a />")
							   .addClass("auto-cap")
							   .addClass("notif-a")
							   .attr("href", uri)
							   .text(text);
 					if(params[0] == "m_") link.removeClass("auto-cap");

					return link[0].outerHTML;
				}
			}
		}
		return '<a href="javascript:void(null);"></a>';
	};

	// Utilities for users and some methods within notificationManager
	NotificationManager.prototype.addNotification = function(notification) {
		this.mobileNotificationList.unshift(notification);
		this.notificationList.push(notification);
		this.tryShowNotifications();
		this.tryShowMobileNotification(notification);
	};

	NotificationManager.prototype.forceCloseMobileNotifications = function() {
		if(this.mobileNotifDialog) this.mobileNotifDialog.hide();
	};

	NotificationManager.prototype.clear = function() {
		this.notificationList = [];
		this.mobileNotificationList = [];
	};

	NotificationManager.prototype.disable = function() {
		// Clear current notifications, and signal that this is the last notification which should be shown
		this.notificationList = [
			{
				tool: "Notifications",
				icon: "megaphone",
				link: "/index",
				text: "Notifications have been disabled for this tab. To re-enable them, refresh the page.",
				time: this.currentTimeString(),
				disable: true
			}
		];
		this.tryShowNotifications();
	};

	NotificationManager.prototype.setMobileCloseHandler = function(handler) {
		this.mobileCloseHandler = handler;
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
			mobileNotificationTemplate: $("#mobileNotificationTemplate").html(),
			timeToShow: 7
		});
		$("#notificationTemplate").remove();
		$("#mobileNotificationTemplate").remove();
	});

})( jQuery );