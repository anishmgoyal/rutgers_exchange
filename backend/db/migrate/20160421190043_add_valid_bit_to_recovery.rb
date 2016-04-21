class AddValidBitToRecovery < ActiveRecord::Migration
  def change
    add_column :password_recovery_requests, :is_valid, :int
  end
end
