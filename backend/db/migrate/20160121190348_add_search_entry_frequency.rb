class AddSearchEntryFrequency < ActiveRecord::Migration
  def change
  	add_column :search_entries, :frequency, :int
  end
end