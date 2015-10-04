class CreateConversations < ActiveRecord::Migration
  def change
    create_table :conversations do |t|
      t.references :seller, index: true
      t.references :buyer, index: true
      t.references :offer
      t.timestamps null: false
    end
  end
end
