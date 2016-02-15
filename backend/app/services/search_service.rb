class SearchService

	include SearchHelper

	def init

		stop_word_path = Rails.root.join("app", "assets", "search", "stopwords.txt")
		
		file = File.open(stop_word_path, "r")
		words = get_word_list(file.read)
		file.close

		@@words = Hash.new(false)
		words.each { |word| @@words[word] = true }

	end

	def is_stop_word(word)
		@@words[word]
	end

end
