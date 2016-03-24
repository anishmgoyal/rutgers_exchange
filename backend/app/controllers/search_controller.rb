class SearchController < ApplicationController

	include SearchHelper

	# TODO: Implement a real search algorithm
	# This is not an ideal search algorithm, not a fast search algorithm, and certainly NOT a scalable one.
	# This needs to be swapped out for a better algorithm if development on this project continues.
	def search
		search_service = ApplicationService.get :SearchService
		query_words = get_word_list params[:query]
		filtered_query_words = []
		query_words.each { |word| filtered_query_words << word unless search_service.is_stop_word word }

		limit = params[:page_size] ? params[:page_size].to_i : 100
		page = params[:page] ? params[:page].to_i - 1 : 0
		offset = page * limit

		results = []

		if query_words.size > 0
			search_entries = SearchEntry.where('word REGEXP ?', query_words.join("|"))
										.select(:product_id, :id)
										.select("sum(frequency) as total_frequency")
										.group(:product_id)
										.order(frequency: :desc)
										.limit(limit)
										.offset(offset)
										.all

			search_entries.each do |entry|
				product = entry.product
				results << {
					product_id: product.id,
					product_name: product.product_name,
					product_price: product.price,
					product_type: product.product_type,
					thumbnail: product.thumbnail
				}
			end
		end

		payload = {
			results: results
		}

		render status: 200, json: payload
	end

end
