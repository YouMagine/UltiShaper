define (require)->
  Backbone = require 'backbone'


  class BlocklyEditorSettings extends Backbone.Model
      idAttribute: 'name'
      defaults:
        name: "blocklyEditor"
        title: "blockly Editor"
        
      constructor:(options)->
        super options
        
  return BlocklyEditorSettings