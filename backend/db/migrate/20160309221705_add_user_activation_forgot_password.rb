class AddUserActivationForgotPassword < ActiveRecord::Migration
  def change
  	add_column :users, :activation, :string
  	remove_column :users, :phone_number
  end
end
