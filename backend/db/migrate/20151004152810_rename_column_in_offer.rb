class RenameColumnInOffer < ActiveRecord::Migration
  def change
    rename_column :offers, :status, :offer_status
  end
end
