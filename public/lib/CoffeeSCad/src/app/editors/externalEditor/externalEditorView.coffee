define (require)->
  $ = require 'jquery'
  _ = require 'underscore'
  require 'bootstrap'
  marionette = require 'marionette'
  jquery_layout = require 'jquery_layout'
  jquery_ui = require 'jquery_ui'
  
  appVent = require 'core/messaging/appVent'
  
  template =  require "text!./externalEditorView.tmpl"


  class ExternalEditorView extends Backbone.Marionette.ItemView
    template: template
    className: "externalEditor"
    ui:
      toolbox: "#externalToolbox"
    
    events:
      "resize:start": "onResizeStart"
      "resize:stop": "onResizeStop"
      "resize":"onResizeStop"
      
    constructor:(options)->
      super options
      @settings = options.settings
      @_setupEventHandlers()
      
      @project = @model
      
          
    _setupEventHandlers: =>
      console.log "_setupEventHandlers()"

      #appVent.on("project:compiled",@onProjectCompiled)
    
    _tearDownEventHandlers:=>
      console.log "_tearDownEventHandlers()"
      #appVent.off("project:compiled",@onProjectCompiled)
    
    codeUpdateFunction:=>
    	# handle data update
    
    clearWorkspace: =>
    
    onRender:=>
      console.log "onRender()"
    
    onDomRefresh:()=>
      console.log "onDomRefresh()"
      # Blockly.inject(document.getElementById('svgDiv'),{ path: 'lib/blockly/',toolbox: toolbox })
      # Blockly.addChangeListener(@codeUpdateFunction)
      
    onResizeStart:=>
      console.log "external editor view resize start"
      
    onResizeStop:=>
      console.log "external editor view resize stop"
      # $('#blockly').css('width',$(window).width()-20)
      #$('#svgDiv').height(@$el.height()-100);
      # $('#svgDiv').height($(document).height()-640);
      # Blockly.fireUiEvent(window, 'resize');
      # console.log(this);
      
    onClose:=>
      console.log "onClose()"
      @_tearDownEventHandlers()
      @project = null
      
  return ExternalEditorView