class AddReadToConversations < ActiveRecord::Migration
  def change
    add_column :conversations, :seller_marker, :int, default: 0
    add_column :conversations, :buyer_marker, :int, default: 0
  end
end
