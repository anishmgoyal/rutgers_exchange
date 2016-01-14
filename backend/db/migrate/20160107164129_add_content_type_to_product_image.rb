class AddContentTypeToProductImage < ActiveRecord::Migration
  def change
  	add_column :product_images, :content_type, :string
  end
end
