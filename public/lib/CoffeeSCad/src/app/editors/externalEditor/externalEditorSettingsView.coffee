define (require)->
  $ = require 'jquery'
  _ = require 'underscore'
  boostrap    = require 'bootstrap'
  marionette  = require 'marionette'
  forms       = require 'backbone-forms'
  
  class MySettingsForm extends Backbone.Form
    
    constructor:(options)->
      if not options.schema
        options.schema=  
          showTrashcan     :
            type: 'Checkbox'
            
        options.fieldsets=[
          "legend":"General settings"
          "fields": ["renderer"]          
        ]
      super options
      
  
  class ExternalEditorSettingsView extends Backbone.Marionette.ItemView
    
    constructor:(options)->
      super options
      @wrappedForm = new MySettingsForm
        model: @model
      
    render:()=>
      if @beforeRender then @beforeRender()
      @trigger("before:render", @)
      @trigger("item:before:render", @)
      
      tmp = @wrappedForm.render()
      @$el.append(tmp.el)
      @$el.addClass("tab-pane")
      @$el.addClass("fade")
      @$el.attr('id',@model.get("name"))

      @bindUIElements()
      if @onRender then @onRender()
      @trigger("render", @)
      @trigger("item:rendered", @)
      return @
      
  return ExternalEditorSettingsView