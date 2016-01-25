class WebappController < ApplicationController

	def get
		uri = request.fullpath
		index = nil
		uri = uri[0...index] if (index = uri.index "?")
		fpath = Rails.root.join("app", "webapp", uri.to_s[1...uri.size])
		if File.exist? fpath
			send_file fpath, disposition: "inline"
		else
			render status: 404, text: fpath
		end
	end

	def get_index
		send_file Rails.root.join("app", "webapp", "index.html"), disposition: "inline"
	end

end
