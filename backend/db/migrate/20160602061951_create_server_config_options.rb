class CreateServerConfigOptions < ActiveRecord::Migration
  def change
    create_table :server_config_options do |t|
      t.string :config_name, index: true, null: false
      t.string :value
      t.timestamps null: false
    end
  end
end
