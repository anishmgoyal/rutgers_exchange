class AddProductMetadata < ActiveRecord::Migration
  def change
  	add_column :products, :condition, :string
  end
end
