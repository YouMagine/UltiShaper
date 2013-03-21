class CreateShapes < ActiveRecord::Migration
  def change
    create_table :shapes do |t|
      t.string :name
      t.text :xmldata

      t.timestamps
    end
  end
end
