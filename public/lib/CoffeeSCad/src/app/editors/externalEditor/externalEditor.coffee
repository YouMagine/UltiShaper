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
      @sketchNeedsReload = true
      @icon = "icon-th-large"
      @myTitle = options.title ? 'External Editor'
      
      @vent.on("project:loaded",@resetEditor)
      @vent.on("project:created",@resetEditor)
      @vent.on("ExternalEditor:show",@showView)
      @vent.on("ExternalEditor:hide",@hideView)
      @vent.on("ExternalEditor:sketchNeedsReload",@setSketchNeedsReload)
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
      @loadData()
      
    hideView:=>
      if @dia
        @dia.hideDialog()

    setSketchNeedsReload:=>
      console.log "setting sketchNeedsReload to true"
      @sketchNeedsReload = true
      
    resetEditor:(newProject)=>
      console.log "resetting external editor"
      @project = newProject
      # console.log "============new project: ",newProject

      if @dia?
        console.log "closing current external editor"
        @dia.close()
        @ExternalEditorView = null
        
      window.loadData = @loadData
      setTimeout(()->
        try
          loadData()
      ,200);
      @showView()
  
    loadData:()=>
      console.log 'externalEditor:loadData() e.g. for loading a sketchs path'
      if @sketchNeedsReload == false
        return;
      console.log "sketchNeedsReload is true, loading of data from blocks."
      for block in Blockly.mainWorkspace.getAllBlocks()
        if block.type && block.type == "polygons_sketch"
          for _input in block.inputList
            for inputTitle in _input.titleRow
              if inputTitle.name == "code"
                code = inputTitle.text_
              if inputTitle.name == "uuid"
                uuid = inputTitle.text_
            if(code && uuid)
              console.log "Found both uuid #{uuid} and the code (#{code}) for a sketch."
            $("#exportArea",frames['externalEditor'].document).val(code)
            if(frames['externalEditor'].loadCode)
              frames['externalEditor'].loadCode()
              @sketchNeedsReload = false

  return ExternalEditor