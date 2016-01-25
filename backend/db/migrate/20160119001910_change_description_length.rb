class ChangeDescriptionLength < ActiveRecord::Migration
  def change
  	change_column :products, :description, :text, limit: 2500
  	change_column :messages, :message, :text, limit: 2500
  end
end
