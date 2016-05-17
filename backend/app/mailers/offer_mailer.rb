class OfferMailer < ApplicationMailer
	include ApplicationHelper

	require 'cgi'
	require 'uri'

	def priceToFixed(price)
		padding = ""
		padding = "0" if price % 10 == 0
		"#{(price / 100.0).round(2)}#{padding}"
	end

	def new_offer_email(user, offer, product, offerer)
		@offerer_link = "#{@@DEFAULT_WEBAPP_URL}/#!/profile/#{offerer.username}"
		@offerer_name = "#{offerer.first_name} #{offerer.last_name}"
		@offer_price = priceToFixed(offer.price)

		@product_link = "#{@@DEFAULT_WEBAPP_URL}/#!/products/view/#{product.id}"
		@product_name = product.product_name

		@app_offer_seller_link = "#{@@DEFAULT_WEBAPP_URL}/#!/offers/selling"

		@app_name = @@APPLICATION_BACKEND_NAME

		mail(to: user.email_address, subject: "New Offer for #{@product_name}")
	end

	def offer_accepted_email(user, offer, product, poster, conversation)
		@offer_price = priceToFixed(offer.price)
		
		@product_link = "#{@@DEFAULT_WEBAPP_URL}/#!/products/view/#{product.id}"
		@product_name = product.product_name

		@poster_profile_link = "#{@@DEFAULT_WEBAPP_URL}/#!/profile/#{poster.username}"
		@poster_name = "#{poster.first_name} #{poster.last_name}"
		@poster_fname = poster.first_name

		@conversation_url = "#{@@DEFAULT_WEBAPP_URL}/#!/messages/#{conversation.id}"

		@app_name = @@APPLICATION_BACKEND_NAME

		mail(to: user.email_address, subject: "Offer Accepted for #{@product_name}")
	end

	def gsub(input, replace)
		search = Regexp.new(replace.keys.map{|x| "(?:#{Regexp.quote(x)})"}.join('|'))
		input.gsub(search, replace)
	end

	def encodeURIComponent(str)
        gsub(
        	CGI.escape(str.to_s),
            '+'   => '%20',  '%21' => '!',  '%27' => "'",  '%28' => '(',  '%29' => ')',  '%2A' => '*', '%7E' => '~'
        )
	end
end
