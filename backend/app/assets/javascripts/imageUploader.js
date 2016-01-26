(function( $ ) {
	
	var ImageUploader = function ImageUploader_cons(params) {
		if(this.constructor !== ImageUploader_cons) return new ImageUploader_cons(params);
		this.elem = params.elem;
		this.form = params.form;
		this.productId = params.productId;
		this.imagePane = params.imagePane;
		this.imageTemplate = params.imageTemplate;
		this.fileInput = this.form.find("#file").hide()[0];
		this.errorPane = params.errorPane;
		this.files = [];
		this.ordinals = [];
		this.isUploading = false;

		this.bindHelp();
		this.bindFileEvents();
	};
	ImageUploader.prototype.bindHelp = function() {
		this.imagePane.find(".image-uploader-how-to-sort").click(function() {
			new Dialog({
				title: "How To Sort",
				content: "Click on an image to give it a number. You can click it again to take away its number. When you post your listing, all of the images with numbers will be displayed first, in order based off of their number; any other images will appear afterwards.",
				wnd: pageLoader.getWnd(),
				offsets: {top: $("nav")}
			}).show();
		});
	};
	ImageUploader.prototype.bindFileEvents = function() {
		$(this.fileInput).change(this.startUpload.bind(this));
		this.elem.click(this.fileInput.click.bind(this.fileInput));
		this.elem[0].addEventListener('dragenter', function(e) {
			if(e.stopPropogation) e.stopPropogation();
			if(e.preventDefault) e.preventDefault();
			else return false;
		}, false);
		this.elem[0].addEventListener('dragover', function(e) {
			if(e.stopPropogation) e.stopPropogation();
			if(e.preventDefault) e.preventDefault();
			else return false;
		}, false);
		this.elem[0].addEventListener('drop', function(e) {
			if(e.stopPropogation) e.stopPropogation();
			if(e.preventDefault) e.preventDefault();

			var dt = e.dataTransfer;

			this.files = dt.files;
		}.bind(this.fileInput), false);
	};
	ImageUploader.prototype.startUpload = function() {
		if(!this.isUploading) {
			if(this.fileInput.files.length + this.files.length > 8) {
				// todo: handle too many files
				new Dialog({
					title: "Upload Error",
					content: "You cannot upload more than 8 images for a single product listing.",
					wnd: pageLoader.getWnd(),
					offsets: {top: $("#nav")}
				}).show();
			} else {
				for(var i = 0; i < this.fileInput.files.length; i++) {
					var file = this.fileInput.files[i];
					if(file.size > 5242880) {
						// todo: handle too large file
						new Dialog({
							title: "Upload Error",
							content: "The image \"" + file.name + "\" exceeds the file size limit of 5MB per file",
							wnd: pageLoader.getWnd(),
							offsets: {top: $("#nav")}
						}).show();
						this.fileInput.value = "";
						return;
					} else if(file.type != "image/jpeg" && file.type != "image/png" && file.type != "image/gif" && file.type != "image/jpg") {
						// todo: handle bad file type
						new Dialog({
							title: "Upload Error",
							content: "The image \"" + file.name + "\" is not an image in PNG, JPEG, or GIF format.",
							wnd: pageLoader.getWnd(),
							offsets: {top: $("#nav")}
						}).show();
						this.fileInput.value = "";
						return;
					}
				}
				this.isUploading = true;
				this.elem.find(".image-uploader-show-for-instruction").css("visibility", "hidden");
				this.elem.find(".image-uploader-show-for-progress").css("visibility", "visible");
				// todo: start the upload
				ImageApi.upload(this.productId, this.form, ImageApi.PRODUCT, this.finishUploadSuccess.bind(this), this.finishUploadError.bind(this));
			}
		}
	};
	ImageUploader.prototype.finishUploadSuccess = function(data) {
		// todo: show error messages, display images that were successful
		this.errorPane.html("");
		for(var i = 0; i < data.results.length; i++) {
			if(!data.results[i].error) {
				var newImg = $(this.imageTemplate);
				newImg.find(".image-uploader-image-block").click(this.toggleOrdinal.bind(this, data.results[i].id));
				newImg.find(".image-uploader-image").attr("src", ImageApi.serverImageURL(data.results[i].id, ImageApi.PRODUCT)).load($(window).trigger.bind($(window), "resize"));
				newImg.find(".image-uploader-delete-button").click(this.removeItem.bind(this, data.results[i].id));
				newImg.attr("id", "image-uploader-upload-result-" + data.results[i].id);
				this.imagePane.append(newImg);
				data.results[i].origin = "client";
				this.files.push(data.results[i]);
				this.imagePane.find(".image-uploader-show-for-notempty").show();
			} else {
				// todo: add the error
			}
		}
		this.finishUploadCommon();
	};
	ImageUploader.prototype.finishUploadError = function(code) {
		// todo: show the error message
		if(code == 403) {
			this.errorPane.html("Your session has expired.");
		} else {
			this.errorPane.html("Failed to connect to server.");
		}
		this.finishUploadCommon();
	};
	ImageUploader.prototype.finishUploadCommon = function() {
		this.isUploading = false;
		this.fileInput.value = '';
		this.elem.find(".image-uploader-show-for-instruction").css("visibility", "visible");
		this.elem.find(".image-uploader-show-for-progress").css("visibility", "hidden");
	};
	ImageUploader.prototype.addItem = function(id) {
		var newImg = $(this.imageTemplate);
		newImg.find(".image-uploader-image-block").click(this.toggleOrdinal.bind(this, id));
		newImg.find(".image-uploader-image").attr("src", ImageApi.serverImageURL(id, ImageApi.PRODUCT)).load($(window).trigger.bind($(window), "resize"));
		newImg.find(".image-uploader-delete-button").click(this.removeItem.bind(this, id));
		newImg.attr("id", "image-uploader-upload-result-" + id);
		this.imagePane.append(newImg);
		this.files.push({
			id: id,
			origin: "server"
		});
		this.imagePane.find(".image-uploader-show-for-notempty").show();
	};
	ImageUploader.prototype.removeItem = function(id) {
		this.imagePane.find("#image-uploader-upload-result-" + id).remove();
		for(var i = 0; i < this.files.length; i++) {
			if(this.files[i].id == id) {
				this.files.splice(i, 1);
				break;
			}
		}
		this.removeFromOrdinal(id);
		if(this.files.length == 0) {
			this.imagePane.find(".image-uploader-show-for-notempty").hide();
		}
		ImageApi.deleteImage(id, ImageApi.PRODUCT, function success(data) {
			// todo: remove this from the list of files
		}, function error(code) {
			// todo: decide how to handle errors with this tool
		});
	};
	ImageUploader.prototype.toggleOrdinal = function(id) {
		if (typeof this.ordinals["index-for-" + id] === "undefined") this.addToOrdinal(id);
		else this.removeFromOrdinal(id);
	};
	ImageUploader.prototype.addToOrdinal = function(id) {
		if(typeof this.ordinals["index-for-" + id] === "undefined") {
			var overlay = this.imagePane.find("#image-uploader-upload-result-" + id).find(".image-uploader-image-overlay");
			overlay.css("visibility", "visible");
			overlay.find(".image-uploader-image-overlay-content").text(this.ordinals.length + 1);
			this.ordinals["index-for-" + id] = this.ordinals.length;
			this.ordinals.push(id);
		}
	};
	ImageUploader.prototype.removeFromOrdinal = function(id) {
		if(typeof this.ordinals["index-for-" + id] !== "undefined") {
			this.imagePane.find("#image-uploader-upload-result-" + id).find(".image-uploader-image-overlay").css("visibility", "hidden");
			this.ordinals.splice(this.ordinals["index-for-" + id], 1);
			for(var i = this.ordinals["index-for-" + id]; i < this.ordinals.length; i++) {
				this.ordinals["index-for-" + this.ordinals[i]] = i;
				this.imagePane.find("#image-uploader-upload-result-" + this.ordinals[i]).find(".image-uploader-image-overlay-content").text(i + 1);
			}
			delete this.ordinals["index-for-" + id];
		}
	};
	ImageUploader.prototype.exportOrder = function(successCallback, errorCallback) {
		if(!this.isUploading) {
			// Lock the uploader. It should be destroyed upon success or error
			this.isUploading = true;

			// Add any files that don't have ordinals into the ordinal list
			for(var j = 0; j < this.files.length; j++) {
				this.addToOrdinal(this.files[j].id);
			}

			// Get the list of ordinals from the array portion of the ordinal field
			var ordinalMap = {};
			for(var i = 0; i < this.ordinals.length; i++) {
				ordinalMap[this.ordinals[i]] = i;
			}
			ImageApi.setOrdinals(ordinalMap, ImageApi.PRODUCT, successCallback, errorCallback);
		} else {
			new Dialog({
				title: "Upload in Progress",
				content: "Please wait until all images have finished uploading before finalizing your listing's images.",
				wnd: pageLoader.getWnd(),
				deleteOnHide: true,
				offsets: {top: $("#nav")}
			}).show();
		}
	};

	window.ImageUploader = ImageUploader;

})( jQuery );