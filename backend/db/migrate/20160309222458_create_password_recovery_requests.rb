class CreatePasswordRecoveryRequests < ActiveRecord::Migration
  def change
    create_table :password_recovery_requests do |t|
      t.references :user
      t.string :recovery_string
      t.string :recovery_code
      t.timestamps null: false
    end
  end
end