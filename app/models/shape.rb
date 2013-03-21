class Shape < ActiveRecord::Base
  attr_accessible :name, :xmldata

  validates :name, :presence => true
  validates :name, :length => { :minimum => 2 }
  validates :name, :length => { :maximum => 30 }
  validates :name, :uniqueness => true
  validates :name, :format => { 
  	:with => /\A[a-zA-Z]/,
    :message => "Only letters (A-Z) allowed as first character."
  }

  validates :name, :format => { 
  	:with => /^[A-Za-z][A-Za-z0-9]*$/, 
  	:message => "Only alphanumeric characters allowed (A-Z and 0-9)." 
  }
  validates :name, :exclusion => { 
  	:in => %w(ultishaper ultimaker youmagine), 
  	:message => "this is a reserved name."
  }

end
