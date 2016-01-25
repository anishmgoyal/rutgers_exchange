module SearchHelper

	def get_word_list(string)
		tk = Tokenizer.new(string)
		words = []
		word = ""
		words << word.downcase while (word = tk.next_word)
		words
	end

	private

		class Tokenizer

			public

				def initialize(string)
					@string = string
					@position = 0
				end

				def next_word

					if @position < @string.length

						# First off, let's get the first letter in this word.
						# Words can contain hyphens, apostraphes, numbers, and letters
						# However, they MUST start with a letter or number
						char = @string[@position]
						until is_alpha(char) or is_num(char) or (@position = @position + 1) == @string.length
							char = @string[@position]
						end

						# Now, if we've got a word character, and haven't run out of string
						# Search for the end of the word
						if @position < @string.length
							word_start = @position
							@position = @position + 1
							char = @string[@position]
							while is_word_char(char) and (@position = @position + 1) < @string.length
								char = @string[@position]
							end

							word = filter_word ( @string [ word_start ... @position ] )

							word.length < 3 ? self.next_word : word
						else
							nil
						end

					end

				end

			private

				# TODO: Implement stemming to improve the accuracy of search results
				def filter_word(word)
					word.gsub /'|\-/, ''
				end

				def is_alpha(c)
					o = c ? c.downcase.ord : 0
					o >= 97 and o <= 122
				end

				def is_num(c)
					o = c ? c.ord : 0
					o >= 48 and o <= 57
				end

				def is_word_char(c)
					is_alpha(c) or is_num(c) or c == '-' or c == '\''
				end

		end

end
