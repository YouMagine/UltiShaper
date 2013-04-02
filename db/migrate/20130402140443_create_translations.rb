class CreateTranslations < ActiveRecord::Migration
  def change
    create_table :translations do |t|
      t.string :fromtext
      t.string :translation
      t.string :language

      t.timestamps
    end
  end
end
