# For 2D editors, SVG, DXF to polyline converters, etc.
# Should work with all kinds of 'child' iframe pages, 
# as long as they output usable JSON.

define (require)->
  $ = require 'jquery'
  _ = require 'underscore'
  Backbone = require 'backbone'
  marionette = require 'marionette'
  
  vent = require 'core/messaging/appVent'
  reqRes = require 'core/messaging/appReqRes'
  Project = require 'core/projects/project'
  
  ExternalEditorSettings = require './externalEditorSettings'
  ExternalEditorSettingsView = require './externalEditorSettingsView'
  ExternalEditorRouter = require "./externalEditorRouter"
  ExternalEditorView = require './externalEditorView'
  DialogView = require 'core/utils/dialogView'

 
  class ExternalEditor extends Backbone.Marionette.Application
    title: "ExternalEditor"
    
    constructor:(options)->
      super options
      @appSettings = options.appSettings ? null
      @settings = options.settings ? new ExternalEditorSettings()
      @project= options.project ? new Project()
      @vent = vent
      @router = new ExternalEditorRouter
        controller: @
      @startWithParent = true
      @showOnAppStart = false
      @addMainMenuIcon = false
      @icon = "icon-th-large"
      @myTitle = options.title ? 'External Editor'
      
      @vent.on("project:loaded",@resetEditor)
      @vent.on("project:created",@resetEditor)
      @vent.on("ExternalEditor:show",@showView)
      @vent.on("ExternalEditor:hide",@hideView)
      @init()

      #@addRegions @regions
      
    init:=>
      if @appSettings?
        @appSettings.registerSettingClass("ExternalEditor", ExternalEditorSettings)
        
      # @loadBlocks()
      @addInitializer ->
        @vent.trigger "app:started", "#{@title}",@
      console.log "app:started #{@title}"
      #if requested we send back the type of SettingsView to use for this specific sub app
      reqRes.addHandler "ExternalEditorSettingsView", ()->
        return ExternalEditorSettingsView
        
    onStart:()=>
      @settings = @appSettings.get("ExternalEditor")
      if @showOnAppStart
        @showView()
      
    showView:=>
      if not @dia?
        @dia = new DialogView({elName:"externalEditor", title: @myTitle, width:300, height:300,position:[525,25], dockable:true})
        @dia.render()
      
      if not @externalEditorView?
        @externalEditorView = new ExternalEditorView 
          model:    @project
          settings: @settings
      
      if not @dia.currentView?    
        @dia.show(@externalEditorView)
      else
        @dia.showDialog()
      
    hideView:=>
      if @dia
        @dia.hideDialog()
      
    resetEditor:(newProject)=>
      console.log "resetting external editor"
      @project = newProject
      # console.log "============new project: ",newProject

      if @dia?
        console.log "closing current external editor"
        @dia.close()
        @ExternalEditorView = null
        
      @loadBlocks()
      @showView()
  
    # loadBlocks:()=>
    #   console.log '-----------------=================----------------'
    #   for model in @project.rootFolder.models
    #     # console.log "========= models::: ",model,model.id
    #     fileParts = model.id.split '.'
    #     ext = fileParts[fileParts.length-1]
    #     modelId = fileParts[0]
    #     # console.log 'ext',ext
    #     # console.log 'project id',@project.id,'model id = ',modelId
    #     if modelId is @project.id
    #       # console.log "adding content",model.storedContent
    #       window.xmlStr = model.storedContent
    #       setTimeout(()->
    #         try
    #           # console.log window.xmlStr
    #           xml = Blockly.Xml.textToDom(window.xmlStr);
    #           Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml)
    #       ,10);
      

  return ExternalEditor