define (require)->
  Backbone = require 'backbone'
  buildProperties = require 'core/utils/buildProperties' #helper for dotted attribute access instead of "get/Set"


  class ExternalEditorSettings extends Backbone.Model
    attributeNames: ['name']
    
    buildProperties @

    idAttribute: 'name'
    defaults:
      name: "externalEditor"
      title: "External Editor"
      showTrashcan:true
        
      constructor:(options)->
        super options
        
  return ExternalEditorSettings