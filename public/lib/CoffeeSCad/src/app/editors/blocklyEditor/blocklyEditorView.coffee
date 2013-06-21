define (require)->
  $ = require 'jquery'
  _ = require 'underscore'
  require 'bootstrap'
  marionette = require 'marionette'
  jquery_layout = require 'jquery_layout'
  jquery_ui = require 'jquery_ui'
  
  appVent = require 'core/messaging/appVent'
  
  template =  require "text!./blocklyEditorView.tmpl"
  utils = require './utils'


  class BlocklyEditorView extends Backbone.Marionette.ItemView
    template: template
    className: "blocklyEditor"
    ui:
      toolbox: "#blocklyToolbox"
    
    events:
      "resize:start": "onResizeStart"
      "resize:stop": "onResizeStop"
      "resize":"onResizeStop"
      
    constructor:(options)->
      super options
      @settings = options.settings
      @_setupEventHandlers()
      
      @project = @model

      @vent = appVent
      
      @cursor_rot=[0,0,0]
      @cursor_trans=[0,0,0]
      @cursor_scale=[1,1,1]
      @colors = selected:[0.6,0.5,0.2],unselected:[124/256,153/256,96/255],limegreen:[122/256,182/256,69/255],subtracting:[0.4,0.4,0.0,0.6]
      @app2 = null
      @codeLanguage = 'vol0.1'#or 'scad' for openscad
      window.skipMyUpdate = false
          
    _setupEventHandlers: =>
      #appVent.on("project:compiled",@onProjectCompiled)
    
    _tearDownEventHandlers:=>
      #appVent.off("project:compiled",@onProjectCompiled)
    
    codeUpdateFunction:=>
      @numUpdates = 0
      @cursor_rot=[0,0,0]
      @cursor_trans=[0,0,0]
      @cursor_scale=[1,1,1]
      window.cursor_rot=@cursor_rot
      window.cursor_move=@cursor_trans
      window.cursor_scale=@cursor_scale
      window.colors = @colors
      if skipMyUpdate
        console.log "Skipping my update...", skipMyUpdate
        return
      # console.log('codeUpdateFunction() ran '+(numUpdates++)+' times');
      xml = utils.getXML()
      console.log({xmlData:xml});
      if typeof inputManager is "object"
        inputs = inputManager.list()
        i = 0
        numSketches = 0
        @sketchVal = '' 
        if window.externalEditor and window.externalEditor.$
          @sketchVal = window.externalEditor.$('#exportArea').val();
          console.log 'SKETCHVALLLLLLL!!!!', @sketchVal
        while inputs.length > i
          console.log "inputs[i].setVal to #{@sketchVal}"
          if @sketchVal != ''
            inputs[i].setVal @sketchVal
          if inputs[i].isType('sketch')
            @vent.trigger 'ExternalEditor:show', "test",@
            numSketches++

          if xml.indexOf(inputs[i].uuid) is -1
            console.log inputManager.list()
            console.log "Was : ", inputs[i], "removed?"
            # TODO: replace with better way to maintain those fields...
            # $("#input" + inputs[i].uuid, planeSvg.document).remove()
            inputs.splice i, 1
            console.log inputManager.list()
          i++
      if numSketches == 0 or inputs.length == 0
        @vent.trigger 'ExternalEditor:hide', "test",@

      hist.addEntry xml  unless typeof hist is "undefined"
      langDropbox = document.getElementById("lang")


      myVars = undefined
      codeLanguage = $("#langDropbox").val()
      codeLanguage = "coffeescad0.1"  unless typeof codeLanguage is "string"
      code = undefined
      
      if codeLanguage is "coffeescad0.1"
        variables = Blockly.Variables.allVariables()
        code = Blockly.Generator.workspaceToCode("JavaScript")
        joinShapesList = code.split(";")
        code = "# coffeescad0.33\nrot=[0,0,0];tr=[0,0,0];";
        code += "colors={selected:[0.6,0.5,0.2],unselected:[124/256,153/256,96/255],limegreen:[122/256,182/256,69/255],subtracting:[0.4,0.4,0.0,0.6]}\n"
        while joinShapesList.length > 0
          str = joinShapesList.shift()
          continue if str.trim().length == 0
          if str.trim().substring(0,4) == 'new '
            code += "\nnewPart = "+str.trim()
            code += "\nassembly.add(newPart)\n"
          else 
            code += "\n"+str.trim()+"\n"

      if codeLanguage is "vol0.1"
        code = "<" + "?xml version=\"1.0\" ?" + ">\n <VOL VersionMajor=\"1\" VersionMinor=\"2\">\n     <Parameters />\n     <uformia.base.Model.20110605 Name=\"43\">"
        code += Blockly.Generator.workspaceToCode("JavaScript")
        code += "\n     </uformia.base.Model.20110605>\n </VOL>"
      if codeLanguage is "scad"
        code = Blockly.Generator.workspaceToCode("JavaScript")
        code = "$fs=0.4;\n$fa=5;\n" + code
        
      #get the project's main file
      fName = "#{@project.name}.ultishape"
      projectMainFile = @project.rootFolder.get(fName)
      if projectMainFile is null
        console.log 'Couldnt get ',"@project.rootFolder.get(#{@project.name}.ultishape)"
      projectMainFile.content = xml

      #get the project's coffeeSCAD file
      projectMainCoffeeFile = @project.rootFolder.get("generated.coffee")
      if projectMainCoffeeFile is undefined
        console.log 'Couldnt get ',"@project.rootFolder.get(generated.coffee"
        @project.addFile({name: 'generated.coffee',content:''})
        projectMainCoffeeFile = @project.rootFolder.get("generated.coffee")
      #set the code : all view will get the propagated content automagically
      projectMainCoffeeFile.content = code
      console.log code
      #document.getElementById("codearea").value = code
      @app2.loadCode code  if @app2 and @app2.loadCode 
    
    clearWorkspace: =>
      # Blockly.mainWorkspace.getTopBlocks(false)[0].dispose();
      # FIXME: shouldn't have to clear twice.
      n = 0
      until typeof Blockly.mainWorkspace.getTopBlocks(false) is "undefined"
        n++
        break  if n > 10
        Blockly.mainWorkspace.getTopBlocks(false)[0].dispose()  unless typeof Blockly.mainWorkspace.getTopBlocks(false)[0] is "undefined"
    
    _blockIsSelected : (block, typeOfCheck) =>
      isSelected = false
      
      # if(block.id && Blockly.selected) console.log("checking if block (id="+block.id+",type="+block.type+') is selected (id='+Blockly.selected.id+',type='+Blockly.selected.type+').');
      # if(!typeOfCheck) typeOfCheck = 'direct';
      return false  unless Blockly.selected # no selection
      
      # console.log("this is the selected block!!!");
      return true  if Blockly.selected.id is block.id #isSelected = true;
      # this is not the shape we're looking for...
      
      # console.log("isShape? "+blockIsShape(block)+" -- not bubbling up, this isn.t the shape we're looking for.");
      return false  if @_blockIsShape(Blockly.selected) and (block.id isnt Blockly.selected.id) # don't bubble up if we have a different shape selected
      if typeOfCheck is "bubbletoshape"
        
        # console.log({a:"checking if it's a shape, otherwise go to parent.",sel:Blockly.selected});
        o = Blockly.selected
        while o.parentBlock_ # as long as it has a parent...
          # check if it's a shape.
          # console.log('block id '+o.id,' in category',o.parentBlock_.category,o.category == ucfirst(LANG.shape));
          return true  if block.id is o.parentBlock_.id  if @_blockIsShape(o.parentBlock_)
          # it's an unselected shape. Stop looking.
          return false  if @_blockIsShape(o.parentBlock_)
          
          # it's not the chosen one, bubble up one level:
          # console.log('bubbling up a level (not a selected shape)');
          o = o.parentBlock_
      isSelected
    
    _blockIsShape : (o) =>
      return false  unless o
      return true  if o.category and (o.category is ucfirst(LANG.shape))
      return true  if o.type and (o.type is "polygons_extrude")
      return true  if o.type and (o.type is "assembly_part")
      false
    
    _createBlockAtCursor:(xmlStr) ->
      # create block after selection and select that block
      # when empty, just paste block:
      xmlStr = "<xml>" + xmlStr + "</xml>"  if xmlStr.substring(0, 5) isnt "<xml>"
      if Blockly.mainWorkspace.getTopBlocks().length is 0
        try
          xml = Blockly.Xml.textToDom(xmlStr)
          Blockly.Xml.domToWorkspace Blockly.mainWorkspace, xml
          Blockly.mainWorkspace.getTopBlocks()[0].select()
        return
      
      # 1. find selection
      console.log "createBlockAtCursor(" + xmlStr + ")"
      dom = Blockly.Xml.textToDom(xmlStr)
      domChild = dom.childNodes[0]
      selectedBlock = Blockly.selected
      console.log "pre paste"
      Blockly.mainWorkspace.paste domChild
      console.log "after paste"
      if selectedBlock isnt null
        topBlocks = Blockly.mainWorkspace.getTopBlocks()
        if insertBlockBefore is false
          if topBlocks.length > 1
            lastBlockAdded = topBlocks[topBlocks.length - 1]
            if lastBlockAdded.outputConnection isnt null
              console.log "Just leaving this block unconnected, since it's an output.", lastBlockAdded
              return
            return  if selectedBlock.nextConnection is null
            if selectedBlock.nextConnection.targetConnection is null
              selectedBlock.nextConnection.connect lastBlockAdded.previousConnection
            else
              console.log "w000t.... complicated stuff."
              return
              secondUpperConnection = selectedBlock.nextConnection.targetConnection
              secondUpperConnection.disconnect()
              selectedBlock.nextConnection.connect lastBlockAdded.previousConnection
              
              # lastBlockAdded.nextConnection.connect(secondUpperConnection);
              Blockly.fireUiEvent window, "resize"
        else
          console.log "insertBlockBefore", insertBlockBefore
          if topBlocks.length > 1
            lastBlockAdded = topBlocks[topBlocks.length - 1]
            if lastBlockAdded.outputConnection isnt null
              console.log "Just leaving this block unconnected, since it's an output.", lastBlockAdded
              return
            return  if selectedBlock.previousConnection is null
            if selectedBlock.previousConnection.targetConnection is null
              selectedBlock.previousConnection.connect lastBlockAdded.nextConnection
            else
              console.log "w000t.... complicated stuff."
              return
    
    onDomRefresh:()=>
      $('#qsResults').css({left: $('#quickSearchDiv').position().left,'min-width': $('#quickSearchDiv').width()})
      
      #Initialize Blockly
      if(typeof initCli == 'function')
        initCli()
      else
        console.log("couldn't load CLI.")
      
      toolbox = @ui.toolbox[0]
      #toolbox = document.getElementById('blocklyToolbox')
      Blockly.inject(document.getElementById('svgDiv'),{ path: 'lib/blockly/',toolbox: toolbox })
      Blockly.addChangeListener(@codeUpdateFunction)
      
      #big bad hack:#TODO: clean this up
      window.blockIsSelected = @_blockIsSelected
      window.blockIsShape= @_blockIsShape
      window.createBlockAtCursor = @_createBlockAtCursor
      
      window.cursor_rot=@cursor_rot
      window.cursor_move=@cursor_trans
      window.cursor_scale=@cursor_scale

    onResizeStart:=>
      
    onResizeStop:=>
      console.log "blockly view resize stop"
      $('#blockly').css('width',$(window).width()-20)
      #$('#svgDiv').height(@$el.height()-100);
      $('#svgDiv').height($(document).height()-640);
      Blockly.fireUiEvent(window, 'resize');
      console.log(this);
      
    onClose:=>
      @_tearDownEventHandlers()
      @project = null
      
  return BlocklyEditorView