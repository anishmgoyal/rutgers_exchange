class CreateSearchEntries < ActiveRecord::Migration
  def change
    create_table :search_entries do |t|
   	  t.string :word, null: false
   	  t.references :product, null: false
      t.string :filter_type, null: false
      t.timestamps null: false
    end
  end
end