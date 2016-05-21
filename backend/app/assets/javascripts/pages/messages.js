// Messages functions almost like a mini-web application inside of rutgers exchange
$(document).ready(function() {

	// When the user leaves the messages application, delete all cached data
	pageLoader.pageChange(function() {
		if(pageLoader.getMainPath().indexOf("/messages") == -1) {
			pageLoader.removeParam("messageApplication");
		}
	});

	pageLoader.mountPage("/messages", true, function(wnd) {
		var subpath = pageLoader.getSubPath();
		var messageApplication = pageLoader.getParam("messageApplication");

		// Check if the message application has been initialized
		if(messageApplication != null) {
			pageLoader.notifyDone();
			var id = subpath.substring(1);
			if(id.length > 0) {
				switchActiveScreens(SWITCH_TYPE.CONVERSATION);
				loadConversation(id);
			} else {
				switchActiveScreens(SWITCH_TYPE.CHATLIST);
			}
		} else {
			$.ajax({
				url: 'pages/messages/index.htm',
				cache: false,
				dataType: 'html',
				success: function(data) {
					wnd.html(data);

					var messageApplication = {
						conversationList: {},
						currentConversation: {},
						mostRecentMessage: -1,
						page: 1,
						htmlElements: {
							convoBox: {},
							message: {},
							panes: {},
							product: {},
							offer: {},
							send: {},
							showFor: {}
						},
						processChatNotification: processChatNotification,
						processNewConversation: processNewConversation,
						processEndConversation: processEndConversation
					};

					pageLoader.setParam("messageApplication", messageApplication);

					messageApplication.chatListScrollbox = new ScrollZone({
						elem: wnd.find('.message-sidebar').first(),
						fg: '#666',
						scrollbarWidth: 1
					});
					messageApplication.conversationScrollbox = new ScrollZone({
						elem: wnd.find('.message-message-pane-inner').first(),
						fg: '#666',
						scrollbarWidth: 1
					});

					messageApplication.htmlElements.convoBox.container = wnd.find("#message-conversation-list");
					messageApplication.htmlElements.convoBox.template = wnd.find("#template_convo_box").html();
					messageApplication.htmlElements.message.container = wnd.find("#message-conversation-container");
					messageApplication.htmlElements.message.template = wnd.find("#template_message").html();
					messageApplication.htmlElements.panes.chatList = wnd.find("#message-sidebar");
					messageApplication.htmlElements.panes.conversation = wnd.find("#message-conversation-pane");
					messageApplication.htmlElements.product.name = wnd.find("#template_meta_product_name");
					messageApplication.htmlElements.offer.price = wnd.find("#template_meta_offer_price");
					messageApplication.htmlElements.showFor.buyer = wnd.find(".show_for_buyer");
					messageApplication.htmlElements.showFor.seller = wnd.find(".show_for_seller");
					messageApplication.htmlElements.send.field = wnd.find("#message-message-field");
					messageApplication.htmlElements.send.button = wnd.find("#message-send-button");

					messageApplication.htmlElements.send.button.click(sendMessage);
					messageApplication.htmlElements.send.field.keyup(sendMessageOnEnter.bind(this, sendMessage));

					wnd.find(".switch-screens").click(pageLoader.redirect.bind(pageLoader, "/messages"));
					wnd.find(".transaction-commit").click(completeTransaction);
					wnd.find(".transaction-cancel").click(cancelTransaction);
					wnd.find(".transaction-edit").click(editOffer);

					wnd.find(".template").remove();
					pageLoader.notifyDone();

					loadConversationList();
				},
				error: function() {
					pageLoader.notifyDone();
					pageLoader.loadHandler(404);
				}
			});
		}
	});

	var loadConversationList = function() {
		ConversationApi.getConversationList(function success(data) {
			var conversations = data.conversations;
			var messageApplication = pageLoader.getParam("messageApplication");
			var currentUserId = pageLoader.getParam("user_id");

			if(conversations.length > 0) {
				messageApplication.htmlElements.convoBox.container.html("");
				for(var i = 0; i < conversations.length; i++) {
					messageApplication.conversationList[conversations[i].id] = conversations[i];

					var chatEntry = $(messageApplication.htmlElements.convoBox.template);
					chatEntry.attr("id", "conversation-skinny-" + conversations[i].id);
					chatEntry.find(".template_product_name").text(conversations[i].product.product_name);
					chatEntry.find(".template_user_name").text(conversations[i].other_user.first_name + " " + conversations[i].other_user.last_name);
					chatEntry.find(".template_offer_price").text(apiHandler.serverCurrencyToClient(conversations[i].offer.price));

					if(conversations[i].num_unread > 0) {
						chatEntry.find(".template_unread_count").text(conversations[i].num_unread + " UNREAD");
					}

					if(conversations[i].prev_message != null) {
						var prevIsCurrent = (conversations[i].prev_message.user_id == currentUserId);
						var previousContainer = chatEntry.find(".message-convo-previous");
						previousContainer.html('<i class="fi-' + ((prevIsCurrent)? "arrow-left" : "arrow-right") + '"></i>&nbsp;&nbsp;');
						previousContainer.append(document.createTextNode(conversations[i].prev_message.message));
					} else {
						chatEntry.find(".message-convo-previous").hide();
					}

					chatEntry.on("click", function(id, e) {
						pageLoader.redirect("/messages/" + id);
					}.bind(this, conversations[i].id));

					messageApplication.htmlElements.convoBox.container.append(chatEntry);
				}
				
				messageApplication.chatListScrollbox.trigger("resize");

				var subpath = pageLoader.getSubPath();
				var convoId;
				if(subpath.length > 1) {
					switchActiveScreens(SWITCH_TYPE.CONVERSATION);
					var intendedConversation = subpath.substring(1);
					var loadedConversation = false;
					for(var j = 0; j < conversations.length; j++) {
						if(conversations[j].id == intendedConversation) {
							loadConversation(intendedConversation);
							loadedConversation = true;
							break;
						}
					}
					if(!loadedConversation) {
						pageLoader.redirect("/messages/" + conversations[0].id);
					}
				} else {
					switchActiveScreens(SWITCH_TYPE.CHATLIST);
					loadConversation(conversations[0].id);
				}
			} else {
				handleNoConversations();
			}
		}, function error(code) {
			if(code == 403) {
				pageLoader.removeParam("messageApplication");
			}
			pageLoader.loadHandler(code);
		});
	};

	var loadConversation = function(id) {

		var messageApplication = pageLoader.getParam("messageApplication");
		if(messageApplication.currentConversation.id != id) {
			// Style this convo box as active, remove active style from previously active convo box
			$(".message-convo-active").removeClass("message-convo-active");
			$("#conversation-skinny-" + id).addClass("message-convo-active")
				// Remove unread count from the convo box
				.find(".template_unread_count").text("");

			if(messageApplication.conversationList[id]) {
				messageApplication.conversationList[id].num_unread = 0;
			}

			ConversationApi.getConversationPage(id, 1, 100, function success(data) {
				var messageApplication = pageLoader.getParam("messageApplication");

				messageApplication.page = 1;
				messageApplication.htmlElements.product.name.text(data.product.product_name);
				messageApplication.htmlElements.offer.price.text(apiHandler.serverCurrencyToClient(data.offer.price));
				messageApplication.currentConversation = data;

				if(data.is_seller) {
					messageApplication.htmlElements.showFor.buyer.hide();
					messageApplication.htmlElements.showFor.seller.css("display", "inline-block");
				}
				else {
					messageApplication.htmlElements.showFor.seller.hide();
					messageApplication.htmlElements.showFor.buyer.css("display", "inline-block");
				}

				var names = {};
				names[data.seller.user_id] = (data.is_seller)? "You" : data.seller.first_name + " " + data.seller.last_name;
				names[data.buyer.user_id] = (!data.is_seller)? "You" : data.buyer.first_name + " " + data.buyer.last_name;

				messageApplication.currentConversation.names = names;

				var messages = data.messages;
				messageApplication.conversationScrollbox.elemContent.html("");
				for(var i = 0; i < messages.length; i++) {
					var messageBox = $(messageApplication.htmlElements.message.template);
					messageBox.find(".template_name").text(names[messages[i].user_id]);
					messageBox.find(".template_date").text(messages[i].created_at);
					messageBox.find(".template_message").text(messages[i].message);
					messageApplication.conversationScrollbox.elemContent.append(messageBox);
				}

				delete messageApplication.currentConversation.messages;

				// Show the messaging client
				$('.message-fillable-parent').show();

				// Resize the scroll pane, go to bottom
				messageApplication.conversationScrollbox.trigger("resize");
				messageApplication.chatListScrollbox.trigger("resize");
				messageApplication.conversationScrollbox.setScrollPosition({percentage: 1});
				
			}, function error(id, code) {
				removeConversation(id);
			}.bind(this, id));
		}
	};

	var handleNoConversations = function() {
		messageTool.loadMessage(pageLoader.getWnd(), 
			"No Conversations", 
			"You do not have any chat conversations. " + 
			"Chat conversations are entered as part of the buying process on " + 
			window.server.serviceName + 
			"; either when you are buying a product, and your offer is accepted " + 
			"by the seller, or when you are selling a product, and accept an offer from a buyer."
		);
	};

	// ------------------------ Async updaters -------------------------

	var removeConversation = function(id) {
		var messageApplication = pageLoader.getParam("messageApplication");
		$("#conversation-skinny-" + id).remove();
		delete messageApplication.conversationList[id];
		if(id == messageApplication.currentConversation.id) {
			for(var newId in messageApplication.conversationList) {
				if(messageApplication.conversationList.hasOwnProperty(newId)) {
					loadConversation(newId);
					return;
				}
			}
			handleNoConversations();
		}
	};

	var processChatNotification = function(notification) {
		var conversationId = notification.conversation;
		var currentUserId = pageLoader.getParam("user_id");
		if(typeof this.conversationList[conversationId] !== "undefined") {

			var conversation = this.conversationList[conversationId];
			conversation.prev_message = notification.message;

			var chatEntry = pageLoader.getWnd().find("#conversation-skinny-" + conversationId)
			var prevIsCurrent = (notification.message.user_id == currentUserId);
			var previousContainer = chatEntry.find(".message-convo-previous");

			if(this.currentConversation.id != conversationId) {
				conversation.num_unread ++;
				chatEntry.find(".template_unread_count").text(conversation.num_unread + " UNREAD");
			}

			previousContainer.show();
			previousContainer.html('<i class="fi-' + ((prevIsCurrent)? "arrow-left" : "arrow-right") + '"></i>&nbsp;&nbsp;');
			previousContainer.append(document.createTextNode(notification.message.message));
		}
		if(this.currentConversation.id == conversationId) {
			if(notification.message.user_id != pageLoader.getParam("user_id")) {
				var messageBox = $(this.htmlElements.message.template);
				messageBox.find(".template_name").text(this.currentConversation.names[notification.message.user_id]);
				messageBox.find(".template_date").text(notification.message.created_at);
				messageBox.find(".template_message").text(notification.message.message);
				this.conversationScrollbox.elemContent.append(messageBox);
				this.conversationScrollbox.trigger("resize");
				this.conversationScrollbox.setScrollPosition({percentage: 1});
				ConversationApi.updateCounter(this.currentConversation.id);
			}
		}
	};

	var processNewConversation = function(notification) {
		if(Object.keys(this.conversationList).length == 0) {
			pageLoader.removeParam("messageApplication");
			pageLoader.reloadPage();
		} else {
			var conversation = notification.conversation;
			this.conversationList[conversation.id] = conversation;

			var chatEntry = $(this.htmlElements.convoBox.template);
			chatEntry.attr("id", "conversation-skinny-" + conversation.id);
			chatEntry.find(".template_product_name").text(conversation.product.product_name);
			chatEntry.find(".template_user_name").text(conversation.other_user.first_name + " " + conversation.other_user.last_name);
			chatEntry.find(".template_offer_price").text(apiHandler.serverCurrencyToClient(conversation.offer.price));

			if(conversation.prev_message != null) {
				var prevIsCurrent = (conversation.prev_message.user_id == currentUserId);
				var previousContainer = chatEntry.find(".message-convo-previous");
				previousContainer.html('<i class="fi-' + ((prevIsCurrent)? "arrow-left" : "arrow-right") + '"></i>&nbsp;&nbsp;');
				previousContainer.append(document.createTextNode(conversation.prev_message.message));
			} else {
				chatEntry.find(".message-convo-previous").hide();
			}

			chatEntry.on("click", function(id, e) {
				pageLoader.redirect("/messages/" + id);
			}.bind(this, conversation.id));

			this.htmlElements.convoBox.container.append(chatEntry);
			this.chatListScrollbox.trigger("resize");
		}
	};

	var processEndConversation = function(notification) {
		removeConversation(notification.conversation);
	};

	// ------------------------ Button handlers ------------------------

	var SWITCH_TYPE = {
		TOGGLE: 0,
		CONVERSATION: 1,
		CHATLIST: 2
	};
	var switchActiveScreens = function(switchType, e) {
		var messageApplication = pageLoader.getParam("messageApplication");
		if(switchType == SWITCH_TYPE.CONVERSATION) {
			messageApplication.htmlElements.panes.conversation.removeClass("hide-for-small");
			messageApplication.htmlElements.panes.chatList.removeClass("hide-for-small").addClass("hide-for-small");
		} else if(switchType == SWITCH_TYPE.CHATLIST) {
			messageApplication.htmlElements.panes.conversation.removeClass("hide-for-small").addClass("hide-for-small");
			messageApplication.htmlElements.panes.chatList.removeClass("hide-for-small");
		} else {
			messageApplication.htmlElements.panes.chatList.toggleClass("hide-for-small");
			messageApplication.htmlElements.panes.conversation.toggleClass("hide-for-small");
		}
		messageApplication.chatListScrollbox.trigger("resize");
		messageApplication.conversationScrollbox.trigger("resize");
		messageApplication.conversationScrollbox.setScrollPosition({percentage: 1});
	};

	var completeTransaction = function(e) {
		var messageApplication = pageLoader.getParam("messageApplication");
		if(messageApplication.currentConversation.is_seller) {
			new Dialog({
				confirm: true,
				content: "Are you sure? This operation will mark your listing sold, and remove the listing as well as this conversation.",
				deleteOnHide: true,
				title: "Finalize Transaction",
				wnd: pageLoader.getWnd(),
				offsets: {
					top: $("#nav")
				},
				onconfirm: function() {
					if(this.currentConversation.is_seller) {
						OfferApi.commitOffer(this.currentConversation.offer.id, function success(data) {
							removeConversation(this.currentConversation.id);
						}.bind(this), function error(code) {
							if(code == 403) {
								pageLoader.removeParam("messageApplication");
							}
							pageLoader.loadHandler(code);
						});
					}
				}.bind(messageApplication)
			}).show();
		}
	};

	var editOffer = function(e) {
		var messageApplication = pageLoader.getParam("messageApplication");
		if(!messageApplication.currentConversation.is_seller) {
			pageLoader.redirect("/offers/edit/" + messageApplication.currentConversation.offer.id + "/messages/" + messageApplication.currentConversation.id);
		}
	};

	var cancelTransaction = function(e) {
		var messageApplication = pageLoader.getParam("messageApplication");
		new Dialog({
			confirm: true,
			content: "Are you sure? This action will delete the current conversation, and is irreversible.",
			deleteOnHide: true,
			title: "Cancel Transaction",
			wnd: pageLoader.getWnd(),
			offsets: {top: $("#nav")},
			onconfirm: function() {
				OfferApi.deleteOffer(this.currentConversation.offer.id, function success(data) {
					removeConversation(this.currentConversation.id);
				}.bind(this));
			}.bind(messageApplication)
		}).show();
	};

	// ------------------------ Event handlers -------------------------

	var sendMessageOnEnter = function(messageSender, e) {
		if(e.which == 13) {
			messageSender();
		}
	};

	var current_pending_message = 0;
	var sendMessage = function(e) {
		var messageApplication = pageLoader.getParam("messageApplication");
		var message = messageApplication.htmlElements.send.field.val();
		var message_send_stub_id = current_pending_message++;

		var messageBox = $(messageApplication.htmlElements.message.template);
		messageBox.find(".template_name").text("You");
		messageBox.find(".template_date").text("sending...");
		messageBox.find(".template_message").text(message);
		messageBox.attr("id", "message-send-stub-pending-" + message_send_stub_id);
		messageApplication.conversationScrollbox.elemContent.append(messageBox);
		messageApplication.conversationScrollbox.trigger("resize");
		messageApplication.conversationScrollbox.setScrollPosition({percentage: 1});

		ConversationApi.sendMessage(messageApplication.currentConversation.id, message, function success(message_send_stub_id, data) {
			// Nothing needs to be done.
			var msgBox = $("#message-send-stub-pending-" + message_send_stub_id);
			msgBox.attr("id", "message-send-stub-sent-" + data.id);
			msgBox.find(".template_date").text(notificationManager.currentTimeString());
		}.bind(window, message_send_stub_id), function error(message_send_stub_id, code) {
			// TODO: Show error "failed to send message"
			if(code == 403) {
				pageLoader.removeParam("messageApplication");
				pageLoader.loadHandler(403);
			} else {
				var msgBox = $("#message-send-stub-pending-" + message_send_stub_id);
				msgBox.find(".template_date").text("failed to send");
				var messageApplication = pageLoader.getParam("messageApplication");
				setTimeout(function() {
					this.fadeOut();
					if(messageApplication) {
						messageApplication.conversationScrollbox.trigger("resize");
						messageApplication.conversationScrollbox.setScrollPosition({percentage: 1});
					}
				}.bind(msgBox, messageApplication), 5000);
			}
		}.bind(window, message_send_stub_id));
		messageApplication.htmlElements.send.field.val("");
	};


});
