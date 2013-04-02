class RemoveColumnsFromTranslations < ActiveRecord::Migration
  def up
    remove_column :translations, :language
  end

  def down
    add_column :translations, :language, :string
  end
end
