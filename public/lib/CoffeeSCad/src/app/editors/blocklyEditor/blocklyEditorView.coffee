define (require)->
  $ = require 'jquery'
  _ = require 'underscore'
  require 'bootstrap'
  marionette = require 'marionette'
  jquery_layout = require 'jquery_layout'
  jquery_ui = require 'jquery_ui'
  
  appVent = require 'core/messaging/appVent'
  
  template =  require "text!./blocklyEditorView.tmpl"


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
      
      @cursor_rot=[0,0,0]
      @cursor_trans=[0,0,0]
      @cursor_scale=[1,1,1]
      @colors = {selected:[0.6,0.5,0.2],unselected:[124/256,153/256,96/255],limegreen:[122/256,182/256,69/255]}
      @app2 = null
      @codeLanguage = 'vol0.1'#or 'scad' for openscad
      
      #Whitelist of blocks to keep.
      keepers = 'shape_cube,shape_cylinder,shape_sphere,assembly_part,math_number,math_arithmetic'.split(',')
      newLanguage = {}
      for x in [0...keepers.length]
        newLanguage[keepers[x]] = Blockly.Language[keepers[x]]
      #Blockly.Language = newLanguage;
    
    _setupEventHandlers: =>
      #appVent.on("project:compiled",@onProjectCompiled)
    
    _tearDownEventHandlers:=>
      #appVent.off("project:compiled",@onProjectCompiled)
    
    myUpdateFunction:->
      @skipMyUpdate = false
      @numUpdates = 0
      
      if @skipMyUpdate
        console.log "Skipping my update...", skipMyUpdate
        return
      # console.log('myUpdateFunction() ran '+(numUpdates++)+' times');
      xml = getXML()
      if typeof inputManager is "object"
        inputs = inputManager.list()
        i = 0
        while inputs.length > i
          if xml.indexOf(@inputs[i].uuid) is -1
            console.log inputManager.list()
            console.log "Was : ", @inputs[i], "removed?"
            $("#input" + @inputs[i].uuid, planeSvg.document).remove()
            inputs.splice i, 1
            console.log inputManager.list()
          i++
      allFields = inputManager.list()
      $("#inputPane").show()
      if allFields.length > 0
        $("#inputModal").show()
      else
        $("#inputModal").hide()
      hist.addEntry xml  unless typeof hist is "undefined"
      langDropbox = document.getElementById("lang")
      cursor_rot = [0, 0, 0]
      cursor_move = [0, 0, 0]
      cursor_scale = [1, 1, 1]
      myVars = undefined
      codeLanguage = $("#langDropbox").val()
      codeLanguage = "coffeescad0.1"  unless typeof codeLanguage is "string"
      code = undefined
      if codeLanguage is "coffeescad0.1"
        variables = Blockly.Variables.allVariables()
        code = Blockly.Generator.workspaceToCode("JavaScript")
        joinShapesList = code.split(";")
        pre = ""
        post = ""
        while joinShapesList.length > 2
          str = joinShapesList.shift()
          continue  if str.substring(0, 4) is "var " # skip variable assignments
          # colors.selected 
          
          # if(joinShapesList.current()=='')
          pre += str.trim() + ".union("
          post += ")"
        code = pre + joinShapesList.shift().trim() + post
        code = "# coffeescad0.1\n\nrot=[0,0,0];tr=[0,0,0];\nreturn " + code
      if codeLanguage is "vol0.1"
        code = "<" + "?xml version=\"1.0\" ?" + ">\n <VOL VersionMajor=\"1\" VersionMinor=\"2\">\n     <Parameters />\n     <uformia.base.Model.20110605 Name=\"43\">"
        code += Blockly.Generator.workspaceToCode("JavaScript")
        code += "\n     </uformia.base.Model.20110605>\n </VOL>"
      if codeLanguage is "scad"
        code = Blockly.Generator.workspaceToCode("JavaScript")
        code = "$fs=0.4;\n$fa=5;\n" + code
      document.getElementById("codearea").value = code
      app2.loadCode code  if app2 and app2.loadCode 
    
    clearWorkspace: =>
      # Blockly.mainWorkspace.getTopBlocks(false)[0].dispose();
      # FIXME: shouldn't have to clear twice.
      n = 0
      until typeof Blockly.mainWorkspace.getTopBlocks(false) is "undefined"
        n++
        break  if n > 10
        Blockly.mainWorkspace.getTopBlocks(false)[0].dispose()  unless typeof Blockly.mainWorkspace.getTopBlocks(false)[0] is "undefined"
    
    _blockIsSelected : (block, typeOfCheck) ->
      isSelected = false
      
      # if(block.id && Blockly.selected) console.log("checking if block (id="+block.id+",type="+block.type+') is selected (id='+Blockly.selected.id+',type='+Blockly.selected.type+').');
      # if(!typeOfCheck) typeOfCheck = 'direct';
      return false  unless Blockly.selected # no selection
      
      # console.log("this is the selected block!!!");
      return true  if Blockly.selected.id is block.id #isSelected = true;
      # this is not the shape we're looking for...
      
      # console.log("isShape? "+blockIsShape(block)+" -- not bubbling up, this isn.t the shape we're looking for.");
      return false  if blockIsShape(Blockly.selected) and (block.id isnt Blockly.selected.id) # don't bubble up if we have a different shape selected
      if typeOfCheck is "bubbletoshape"
        
        # console.log({a:"checking if it's a shape, otherwise go to parent.",sel:Blockly.selected});
        o = Blockly.selected
        while o.parentBlock_ # as long as it has a parent...
          # check if it's a shape.
          # console.log('block id '+o.id,' in category',o.parentBlock_.category,o.category == ucfirst(LANG.shape));
          return true  if block.id is o.parentBlock_.id  if blockIsShape(o.parentBlock_)
          # it's an unselected shape. Stop looking.
          return false  if blockIsShape(o.parentBlock_)
          
          # it's not the chosen one, bubble up one level:
          # console.log('bubbling up a level (not a selected shape)');
          o = o.parentBlock_
      isSelected
    
    _blockIsShape = (o) ->
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
      
      #Blockly.selected.workspace.paste(domChild);
      Blockly.mainWorkspace.paste domChild
      console.log "after paste"
      if selectedBlock isnt null
        
        # xmlStr = '<xml><block type="polygons_extrude" inline="true" x="-10" y="16"><value name="extrudeZ"><block type="math_number"><title name="NUM">20</title></block></value><statement name="shapeToExtrude"><block type="polygons_polygon"><title name="polyName">polyline</title><statement name="pointList"><block type="polygons_point" inline="true"><next><block type="polygons_point" inline="true"><value name="tX"><block type="math_number"><title name="NUM">10</title></block></value><next><block type="polygons_point" inline="true"><value name="tY"><block type="math_number"><title name="NUM">10</title></block></value></block></next></block></next></block></statement></block></statement></block></xml>';
        # xmlStr = '<xml><block type="shape_sphere" inline="true" x="21" y="-15"><value name="radius"><block type="math_number"><title name="NUM">10</title></block></value><next><block type="shape_sphere" inline="true"><value name="radius"><block type="math_number"><title name="NUM">20</title></block></value></block></next></block></xml>';
        # xmlStr = '<xml><block type="shape_sphere" inline="true" x="0" y="0"></block></xml>';
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
      toolbox = document.getElementById('blocklyToolbox')
      console.log "toolbox",toolbox
      #Blockly.inject(document.getElementById('svgDiv'),{ path: '../../',toolbox: toolbox })
      Blockly.inject(document.getElementById('svgDiv'),{ path: 'lib/blockly/',toolbox: toolbox })
      Blockly.addChangeListener(@myUpdateFunction)

    onResizeStart:=>
    onResizeStop:=>
      
    onClose:=>
      @_tearDownEventHandlers()
      @project = null
      
  return BlocklyEditorView