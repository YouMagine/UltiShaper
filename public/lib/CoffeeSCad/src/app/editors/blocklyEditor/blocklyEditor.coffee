define (require)->
  $ = require 'jquery'
  _ = require 'underscore'
  Backbone = require 'backbone'
  marionette = require 'marionette'
  
  vent = require 'core/messaging/appVent'
  reqRes = require 'core/messaging/appReqRes'
  Project = require 'core/projects/project'
  
  BlocklyEditorSettings = require './blocklyEditorSettings'
  BlocklyEditorSettingsView = require './blocklyEditorSettingsView'
  BlocklyEditorRouter = require "./blocklyEditorRouter"
  BlocklyEditorView = require './blocklyEditorView'
  DialogView = require 'core/utils/dialogView'

 
  class BlocklyEditor extends Backbone.Marionette.Application
    title: "BlocklyEditor"
    
    constructor:(options)->
      super options
      @appSettings = options.appSettings ? null
      @settings = options.settings ? new BlocklyEditorSettings()
      @project= options.project ? new Project()
      @vent = vent
      @router = new BlocklyEditorRouter
        controller: @
      @startWithParent = true
      @showOnAppStart = true
      @addMainMenuIcon = true
      @icon = "icon-th-large"
      
      @vent.on("project:loaded",@resetEditor)
      @vent.on("project:created",@resetEditor)
      @vent.on("blocklyEditor:show",@showView)
      @init()

      #@addRegions @regions
      
    init:=>
      if @appSettings?
        @appSettings.registerSettingClass("BlocklyEditor", BlocklyEditorSettings)
        
      @loadBlocks()
      @addInitializer ->
        @vent.trigger "app:started", "#{@title}",@
      console.log "app:started #{@title}"
      #if requested we send back the type of SettingsView to use for this specific sub app
      reqRes.addHandler "BlocklyEditorSettingsView", ()->
        return BlocklyEditorSettingsView
        
    onStart:()=>
      @settings = @appSettings.get("BlocklyEditor")
      @showView()
      
    showView:=>
      if not @dia?
        @dia = new DialogView({elName:"blocklyEdit", title: "Drag-and-Drop 3D design", width:500, height:200,position:[25,25], dockable:true})
        @dia.render()
      
      if not @blocklyEditorView?
        @blocklyEditorView = new BlocklyEditorView 
          model:    @project
          settings: @settings
      
      if not @dia.currentView?    
        @dia.show(@blocklyEditorView)
      else
        @dia.showDialog()
      
    hideView:=>
      @dia.hideDialog()
      
    resetEditor:(newProject)=>
      console.log "resetting Blockly editor"
      @project = newProject
      # console.log "============new project: ",newProject

      if @dia?
        console.log "closing current Blockly editor"
        @dia.close()
        @blocklyEditorView = null
        
      @loadBlocks()
      @showView()
  
    loadBlocks:()=>
      console.log '-----------------=================----------------'
      for model in @project.rootFolder.models
        # console.log "========= models::: ",model,model.id
        fileParts = model.id.split '.'
        ext = fileParts[fileParts.length-1]
        modelId = fileParts[0]
        # console.log 'ext',ext
        # console.log 'project id',@project.id,'model id = ',modelId
        if modelId is @project.id
          # console.log "adding content",model.storedContent
          window.xmlStr = model.storedContent
          setTimeout(()->
            try
              # console.log window.xmlStr
              xml = Blockly.Xml.textToDom(window.xmlStr);
              Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml)
          ,10);
      

  return BlocklyEditor