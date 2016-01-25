class SearchEntry < ActiveRecord::Base

	extend SearchHelper

	# Relations
	belongs_to :product

	@@title_weight = 2
	@@description_weight = 1

	def self.build_index(product)

		search_service = ApplicationService.get :SearchService

		title = product.product_name
		words = get_word_list(title)

		frequency_map = Hash.new(0)
		words.each { |word| frequency_map[word] = frequency_map[word] + @@title_weight unless search_service.is_stop_word word }

		description = product.description
		words = get_word_list(description)

		words.each { |word| frequency_map[word] = frequency_map[word] + @@description_weight unless search_service.is_stop_word word }

		entries = []
		frequency_map.each do |word, frequency|
			entries << SearchEntry.new(word: word, frequency: frequency, product_id: product.id, filter_type: product.product_type)
		end

		SearchEntry.transaction do
			entries.each { |entry| entry.save }
		end
	end

	def self.destroy_index(product)
		SearchEntry.where(product_id: product.id).destroy_all
	end

end