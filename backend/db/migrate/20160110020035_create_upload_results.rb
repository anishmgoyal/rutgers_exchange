class CreateUploadResults < ActiveRecord::Migration
  def change
    create_table :upload_results do |t|
      t.references :user, index: true
      t.text :output, limit: 65535
      t.timestamps null: false
    end
  end
end
