class WebappController < ApplicationController

	caches_page :get
	caches_page :get_index

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
	
	def core_search
		# gets the core search application
	end

	def get_index
		# send_file Rails.root.join("app", "webapp", "index.html"), disposition: "inline"
	end
	
	require 'net/http'
	
	def network_request

		url = URI.parse(params[:url])

		req = Net::HTTP::Get.new(url.to_s)
		res = Net::HTTP.start(url.host, url.port) { |http| http.request(req) }

		render text: res.body, status: 200

	end

end
