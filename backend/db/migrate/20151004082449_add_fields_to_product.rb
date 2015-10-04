class AddFieldsToProduct < ActiveRecord::Migration
  def change
    add_column :products, :product_name, :string
    add_column :products, :price, :int
    add_column :products, :type, :string
    add_column :products, :description, :string
    add_column :products, :sold_status, :string
    add_column :products, :user_id, :int
    add_index :products, :user_id
  end
end
