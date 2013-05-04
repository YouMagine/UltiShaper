define (require)->
  $ = require 'jquery'
  _ = require 'underscore'
  Backbone = require 'backbone'
  marionette = require 'marionette'
  
  vent = require 'core/messaging/appVent'
  reqRes = require 'core/messaging/appReqRes'
  Project = require 'core/projects/project'
  
  BlocklyEditorSettings = require './blocklyEditorSettings'
  #blocklyEditorSettingsView = require './blocklyEditorSettingsView'
  #blocklyEditorRouter = require "./blocklyEditorRouter"
  BlocklyEditorView = require './blocklyEditorView'
  DialogView = require 'core/utils/dialogView'

 
  class BlocklyEditor extends Backbone.Marionette.Application
    title: "blocklyEditor"
    
    constructor:(options)->
      super options
      @appSettings = options.appSettings ? null
      @settings = options.settings ? new BlocklyEditorSettings()
      @project= options.project ? new Project()
      @vent = vent
      #@router = new blocklyEditorRouter
      #  controller: @
      @icon = "icon-th-large"
      
      @vent.on("project:loaded",@resetEditor)
      @vent.on("project:created",@resetEditor)
      @vent.on("blocklyEditor:show",@showView)
      @init()

      #@addRegions @regions
      
    init:=>
      if @appSettings?
        @appSettings.registerSettingClass("blocklyEditor", BlocklyEditorSettings)
        
      @addInitializer ->
        @vent.trigger "app:started", "#{@title}",@
      
      #if requested we send back the type of SettingsView to use for this specific sub app
      reqRes.addHandler "blocklyEditorSettingsView", ()->
        return blocklyEditorSettingsView
        
    onStart:()=>
      @settings = @appSettings.get("blocklyEditor")
      @showView()
      
    showView:=>
      if @dia?
        @dia.close()
      @dia = new DialogView({elName:"blocklyEdit", title: "Blockly", width:500, height:200,position:[325,25], dockable:true})
      @dia.render()
      
      if not @blocklyEditorView?
        @blocklyEditorView = new BlocklyEditorView 
          model:    @project
          settings: @settings
      
      @dia.show(@blocklyEditorView)
      
    resetEditor:(newProject)=>
      console.log "resetting Blockly editor"
      @project = newProject
      if @dia?
        console.log "closing current Blockly editor"
        @dia.close()
        @blocklyEditorView.close()
        @blocklyEditorView = null
        
      @showView()
  
  return BlocklyEditor