class CreateOffers < ActiveRecord::Migration
  def change
    create_table :offers do |t|
      t.references :user, index: true
      t.references :product, index: true
      t.references :conversation
      t.integer :price
      t.string :status
      t.timestamps null: false
    end
  end
end
