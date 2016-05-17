/**
 * Created by Anish M Goyal (founder)
 *
 * This is a simple dialog box, heavily derivative from
 * the code for the loading icon.
 */
(function( $ ) {
	
	var Dialog = function dialog_cons(params) {
		if(this.constructor !== dialog_cons) {
			return new dialog_cons(params);
		}
		
		// Font sizing
		this.fontSize = 1;
		this.letterSpacing = 0;
		
		// Calculate offsets for loading icon. Adjust by any offsets.
		this.wnd = params.wnd;
		this.offsets = params.offsets;

		this.width = 400;
		this.height = 220;
		if(params.hasOwnProperty("width")) this.width = params.width;
		if(params.hasOwnProperty("height")) this.height = params.height;

		if(params.hasOwnProperty("deleteOnHide")) this.deleteOnHide = params.deleteOnHide;
		else this.deleteOnHide = true;

		this.buttonText = "OK";
		if(params.hasOwnProperty("buttonText")) this.buttonText = params.buttonText;

		var hideFn = (function(instance) {
			return function(e) {
				// If the target isn't a child of the dialog, which should be the only DOM element with
				// the class "dialog", then the click was on the overlay. Close the dialog.
				if(!$(e.target).closest(".dialog").hasClass("dialog"))
					instance.hide.call(instance);
			}
		})(this);
		var closeFn = (function(instance) {
			return function() {
				instance.hide.call(instance);
			}
		})(this);
		
		// Create the overlay container
		this.container = $('<div class="dialog-overlay" />')
			.click(hideFn);
			
		// Make and attach a text element.
		this.dialog = $('<div class="dialog" />')
			.css("font-size", this.fontSize + "em")
			.css("height", this.height + "px")
			.css("width", this.width + "px");

		this.titlebar = $('<div class="dialog-title" />')
			.html(params.title);

		this.pane = $('<div class="dialog-pane" />');
		if(params.contentIsElem)
			this.pane.append(params.content.clone(true, true));
		else
			this.pane.html(params.content);

		this.dialog.append(this.titlebar).append(this.pane);

		if(params.confirm) {

			var confirm = (function(instance) {
				return function() {
					instance.confirm.call(instance);
				}
			})(this);
			var cancel = (function(instance) {
				return function() {
					instance.cancel.call(instance);
				}
			})(this);

			this.buttonbar = $('<div class="dialog-buttons" />');
			this.confirmButton = $('<div class="dialog-button dialog-active" />')
				.click(confirm)
				.html("Yes");
			this.cancelButton = $('<div class="dialog-button" />')
				.click(cancel)
				.html("No");
			this.isConfirm = true;
			this.buttonbar.append(this.confirmButton).append(this.cancelButton);
			this.dialog.append(this.buttonbar);

			this.onconfirm = params.onconfirm;
			this.oncancel = params.oncancel;
			this.storage = params.storage;
		} else {

			var submit = (params.hasOwnProperty("onsubmit"))? this.submit.bind(this) : this.hide.bind(this);
			this.buttonbar = $('<div class="dialog-buttons" />');
			this.button = $('<div class="dialog-button dialog-active dialog-expand" />')
				.click(submit)
				.html(this.buttonText);
			this.isConfirm = true;
			this.onsubmit = params.onsubmit;
			this.buttonbar.append(this.button);
			this.dialog.append(this.buttonbar);
		}

		this.onhide = params.onhide;

		// Show x button
		this.titlebar.append($('<div class="dialog-close-button"><i class="fi-x"></i></div>').click(closeFn));

		
		// Add all of this to the body
		this.container.append(this.dialog);
		$(document.body).append(this.container);
		this.container.hide();

		this.pane.find("a, .dialog-closer").click(this.hide.bind(this));

		return this;
	};
	Dialog.prototype.show = function() {
		$(document.body).append(this.container);
		var instance = this;
		var resizeFn = (function(resize) {
			return function() {instance.resize.call(instance);};
		})(instance);
		this.container.css("display", "block");
		this.dialog.css("display", "block");
		this.resizer = resizeFn;
		this.resizer();
		$(window).bind("resize", this.resizer);
		return this;
	};
	Dialog.prototype.hide = function() {
		$(window).unbind("resize", this.resizer);
		delete this.resizer;
		this.container.css("display", "none");
		this.dialog.css("display", "none");

		if(typeof this.onhide !== "undefined") {
			this.onhide.call(this);
		}
		
		if(this.deleteOnHide) {
			this.dialog.remove();
			this.container.remove();
		} else return this;
	};
	Dialog.prototype.resize = function() {
		// Calculate the top left corner's position
		var posX = 0;
		var posY = 0;
		var extraPosX = 0;
		var extraPosY = 0;
		if(typeof this.wnd !== "undefined") {
			posX = this.wnd.position().left;
			posY = this.wnd.position().top;
		}
		if(typeof this.offsets !== "undefined") {
			if(typeof this.offsets.left !== "undefined") {
				extraPosX = this.offsets.left.outerHeight();
				posX += this.offsets.left.outerWidth();
			}
			if(typeof this.offsets.top !== "undefined") {
				extraPosY = this.offsets.top.outerHeight();
				posY += this.offsets.top.outerHeight();
			}
		}
		
		// Precalculate reused values
		var wndWidth = (typeof this.wnd === "undefined")? $(window).width() : this.wnd.outerWidth();
		var wndHeight = (typeof this.wnd === "undefined")? $(window).height() : this.wnd.outerHeight();
		
		// Adjust the height in case the selected window is really large
		var wndHeightLim = $(window).height();
		if(wndHeightLim < wndHeight) wndHeight = wndHeightLim;
		
		var overlayWidth = wndWidth - extraPosX;
		var overlayHeight = wndHeight - extraPosY;

		// Apply changes to container
		this.container
			.css("left", posX)
			.css("top", posY)
			.css("width", overlayWidth)
			.css("height", overlayHeight);
		
		this.dialog.css("width", this.width);
		this.dialog.css("height", this.height);

		// Precalculate text sizing
		var dialogWidth = this.dialog.outerWidth();
		var dialogHeight = this.dialog.outerHeight();

		if(dialogWidth > overlayWidth - 20) {
			dialogWidth = overlayWidth - 20;
			this.dialog.css("width", dialogWidth);
		}

		if(dialogHeight > overlayHeight - 20) {
			dialogHeight = overlayHeight - 20;
			this.dialog.css("height", dialogHeight);
		}
		
		// Apply changes to text elem
		this.dialog
			.css("left", posX + (overlayWidth - dialogWidth) / 2)
			.css("top", posY + (overlayHeight - dialogHeight) / 2);

		var paneHeight = this.dialog.innerHeight() - this.titlebar.outerHeight();
		if(this.isConfirm) paneHeight -= this.buttonbar.outerHeight();
		this.pane.css("height", (paneHeight) + "px");

	};
	Dialog.prototype.submit = function() {
		if(typeof this.onsubmit !== "undefined") {
			if(this.onsubmit.call(this)) this.hide();
		}
	};
	Dialog.prototype.confirm = function() {
		this.hide();
		if(typeof this.onconfirm !== "undefined") {
			this.onconfirm.call(this);
		}
	};
	Dialog.prototype.cancel = function() {
		this.hide();
		if(typeof this.oncancel !== "undefined") {
			this.oncancel.call(this);
		}
	};

	window.Dialog = Dialog;

})( jQuery );
