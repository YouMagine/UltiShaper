class Translation < ActiveRecord::Base
  attr_accessible :fromtext, :language, :translation
  validates_uniqueness_of :fromtext, :scope => :language

	validates :language, :format => { 
  	:with => /^[A-Za-z]{2}_[A-Za-z0-9]{2}$/, 
  	:message => "The format AB_CD is accepted, e.g. EN_EN."
  }

end
