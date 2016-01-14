class CreateProductImages < ActiveRecord::Migration
  def change
    create_table :product_images do |t|
      t.string :image_location
      t.string :session_id
      t.integer :ordinal
      t.references :user
      t.references :product, index: true
      t.timestamps null: false
    end
  end
end
