class CreateSessions < ActiveRecord::Migration
  def change
    create_table :sessions do |t|
      t.references :user, index: true
      t.string :session_token, index: true
      t.string :csrf_token
      t.string :user_agent
      t.string :device_notification_type
      t.boolean :evicted, default: 0
      t.timestamps null: false
    end
  end
end
