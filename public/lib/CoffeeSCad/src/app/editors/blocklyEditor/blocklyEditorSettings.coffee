define (require)->
  Backbone = require 'backbone'
  buildProperties = require 'core/utils/buildProperties' #helper for dotted attribute access instead of "get/Set"


  class BlocklyEditorSettings extends Backbone.Model
    attributeNames: ['name','showTrashcan']
    
    buildProperties @

    idAttribute: 'name'
    defaults:
      name: "blocklyEditor"
      title: "blockly Editor"
      showTrashcan:true
        
      constructor:(options)->
        super options
        
  return BlocklyEditorSettings