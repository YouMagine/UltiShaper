var cursor_rot=[0,0,0];
var cursor_trans=[0,0,0];
var cursor_scale=[1,1,1];
var colors = {selected:[0.6,0.5,0.2],unselected:[124/256,153/256,96/255],limegreen:[122/256,182/256,69/255]};
var app2;
var codeLanguage = 'vol0.1';//or 'scad' for openscad

/**
 * Initialize Blockly
 */
function init() {
  if(typeof initCli == 'function')
    initCli();
  else console.log("couldn't load CLI.");
  

  $("#blockly,#inputModal").draggable({ handle: "h5" });
  // $("#blockly").css({ top: $(window).height() - $("#blockly").height() });
  $("#blockly h5,#inputModal h5").css({ cursor: "hand" });
  $('#qsResults').css({left: $('#quickSearchDiv').position().left,'min-width': $('#quickSearchDiv').width()}
    );
  // var toolbox = '<xml>';
  //   toolbox += '  <block type="controls_if"></block>';
  //   toolbox += '  <block type="controls_repeat"></block>';
  //   toolbox += '</xml>';
  var keepers = 'shape_cube,shape_cylinder,shape_sphere,assembly_part,math_number,math_arithmetic'.split(',');
  // Whitelist of blocks to keep.
  var newLanguage = {};
  for (var x = 0; x < keepers.length; x++) {
    newLanguage[keepers[x]] = Blockly.Language[keepers[x]];
  }
  // Blockly.Language = newLanguage;

  var toolbox = document.getElementById('toolbox');
  Blockly.inject(document.getElementById('svgDiv'),{ path: '../../',toolbox: toolbox });

  Blockly.addChangeListener(myUpdateFunction);

} // end of function init

function clearWorkspace() {
  // Blockly.mainWorkspace.getTopBlocks(false)[0].dispose();
  // FIXME: shouldn't have to clear twice.
  var n=0;
  while(typeof Blockly.mainWorkspace.getTopBlocks(false) !='undefined') {
    n++;
    if(n>10) 
      break;
    if(typeof Blockly.mainWorkspace.getTopBlocks(false)[0] !='undefined')
      Blockly.mainWorkspace.getTopBlocks(false)[0].dispose();
  }
}


var numUpdates = 0;
var skipMyUpdate = false;
function myUpdateFunction() {
  if(skipMyUpdate) {
    console.log("Skipping my update...",skipMyUpdate);
    return;
  }
  // console.log('myUpdateFunction() ran '+(numUpdates++)+' times');
  var xml = getXML();
  if(typeof inputManager === 'object') {
    inputs = inputManager.list();
        for(var i=0;inputs.length > i;i++){
            if(xml.indexOf(this.inputs[i].uuid) === -1) {
                console.log(inputManager.list());
                console.log('Was : ',this.inputs[i], 'removed?');
                $("#input"+this.inputs[i].uuid,planeSvg.document).remove();
                inputs.splice(i,1);
                console.log(inputManager.list());
            }
        }    
  }
  allFields = inputManager.list();
  $('#inputPane').show();
  if(allFields.length > 0) {
      $('#inputModal').show();
  } else {
      $('#inputModal').hide();
  }


  if(typeof hist !='undefined') hist.addEntry(xml);

  var langDropbox = document.getElementById("lang");
  cursor_rot=[0,0,0];
  cursor_move=[0,0,0];
  cursor_scale=[1,1,1];
  var myVars;
  codeLanguage = $('#langDropbox').val();
  if(typeof codeLanguage != 'string') 
    codeLanguage = 'coffeescad0.1';

    var code;
    if(codeLanguage == 'coffeescad0.1') {
      var variables = Blockly.Variables.allVariables();

      code = Blockly.Generator.workspaceToCode('JavaScript');

      joinShapesList = code.split(';');
      var pre =''; var post='';
      while(joinShapesList.length > 2) {
        var str = joinShapesList.shift();
        if(str.substring(0,4)=='var ')
          continue; // skip variable assignments
        /* colors.selected */
        // if(joinShapesList.current()=='')
        pre += str.trim()+".union("; post += ")";
      }
      code = pre+joinShapesList.shift().trim()+post;
      code = "# coffeescad0.1\n\nrot=[0,0,0];tr=[0,0,0];\nreturn "+code;
    }
    if (codeLanguage == 'vol0.1') {
      code = '<'+'?xml version="1.0" ?'+'>\n <VOL VersionMajor="1" VersionMinor="2">\n     <Parameters />\n     <uformia.base.Model.20110605 Name="43">';
      code += Blockly.Generator.workspaceToCode('JavaScript');
      
       code += '\n     </uformia.base.Model.20110605>\n </VOL>';
    }
    if(codeLanguage == 'scad') {
      code = Blockly.Generator.workspaceToCode('JavaScript');
      code = "$fs=0.4;\n$fa=5;\n"+code;
    }
    document.getElementById('codearea').value = code;
    if(app2 && app2.loadCode)
      app2.loadCode(code);
}


function blockIsSelected(block,typeOfCheck) {
  var isSelected = false;
  // if(block.id && Blockly.selected) console.log("checking if block (id="+block.id+",type="+block.type+') is selected (id='+Blockly.selected.id+',type='+Blockly.selected.type+').');
  // if(!typeOfCheck) typeOfCheck = 'direct';
  if(!Blockly.selected) return false; // no selection
  if(Blockly.selected.id == block.id) {
    // console.log("this is the selected block!!!");
    return true;//isSelected = true;
  }
  if(blockIsShape(Blockly.selected) && (block.id != Blockly.selected.id)) // this is not the shape we're looking for...
  {
    // console.log("isShape? "+blockIsShape(block)+" -- not bubbling up, this isn.t the shape we're looking for.");
    return false; // don't bubble up if we have a different shape selected

  }

  if(typeOfCheck == 'bubbletoshape') {
    // console.log({a:"checking if it's a shape, otherwise go to parent.",sel:Blockly.selected});
    var o = Blockly.selected;
    while(o.parentBlock_) { // as long as it has a parent...
      if(blockIsShape(o.parentBlock_)) { // check if it's a shape.
      // console.log('block id '+o.id,' in category',o.parentBlock_.category,o.category == ucfirst(LANG.shape));
      if(block.id == o.parentBlock_.id)
        return true;
      }
      if(blockIsShape(o.parentBlock_)) // it's an unselected shape. Stop looking.
        return false;
      // it's not the chosen one, bubble up one level:
      // console.log('bubbling up a level (not a selected shape)');
      o = o.parentBlock_;
    }
  }
  return isSelected;
}

function blockIsShape (o) {
  if(!o) return false;
  if(o.category && (o.category == ucfirst(LANG.shape))) return true;
  if(o.type && (o.type == "polygons_extrude")) return true;
  if(o.type && (o.type == "assembly_part")) return true;
  return false;
}

function createBlockAtCursor(xmlStr){
  // create block after selection and select that block
  // when empty, just paste block:
  if(xmlStr.substring(0,5) !== '<xml>') {
    xmlStr = '<xml>'+xmlStr+'</xml>';
  }

  if(Blockly.mainWorkspace.getTopBlocks().length == 0)
  {
    try {
      var xml = Blockly.Xml.textToDom(xmlStr);      
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
      Blockly.mainWorkspace.getTopBlocks()[0].select();
    } catch(err){

    }  
    return;
  }
    // 1. find selection
    console.log('createBlockAtCursor('+xmlStr+')');
  var dom = Blockly.Xml.textToDom(xmlStr);
  var domChild = dom.childNodes[0];

  var selectedBlock = Blockly.selected;
  console.log('pre paste');
  //Blockly.selected.workspace.paste(domChild);
  Blockly.mainWorkspace.paste(domChild);
  console.log('after paste');

  if(selectedBlock !== null)
  {
    // xmlStr = '<xml><block type="polygons_extrude" inline="true" x="-10" y="16"><value name="extrudeZ"><block type="math_number"><title name="NUM">20</title></block></value><statement name="shapeToExtrude"><block type="polygons_polygon"><title name="polyName">polyline</title><statement name="pointList"><block type="polygons_point" inline="true"><next><block type="polygons_point" inline="true"><value name="tX"><block type="math_number"><title name="NUM">10</title></block></value><next><block type="polygons_point" inline="true"><value name="tY"><block type="math_number"><title name="NUM">10</title></block></value></block></next></block></next></block></statement></block></statement></block></xml>';
    // xmlStr = '<xml><block type="shape_sphere" inline="true" x="21" y="-15"><value name="radius"><block type="math_number"><title name="NUM">10</title></block></value><next><block type="shape_sphere" inline="true"><value name="radius"><block type="math_number"><title name="NUM">20</title></block></value></block></next></block></xml>';
    // xmlStr = '<xml><block type="shape_sphere" inline="true" x="0" y="0"></block></xml>';
    var topBlocks = Blockly.mainWorkspace.getTopBlocks();
    if(insertBlockBefore == false) {
      if(topBlocks.length > 1) {
        var lastBlockAdded = topBlocks[topBlocks.length-1];
        if(lastBlockAdded.outputConnection !== null) {
          console.log("Just leaving this block unconnected, since it's an output.",lastBlockAdded);
          return;
        }
        if(selectedBlock.nextConnection === null) return;
        if(selectedBlock.nextConnection.targetConnection === null) {
          selectedBlock.nextConnection.connect(lastBlockAdded.previousConnection);
        } else {
          console.log("w000t.... complicated stuff.");
          return;
          var secondUpperConnection = selectedBlock.nextConnection.targetConnection;
          secondUpperConnection.disconnect();
          selectedBlock.nextConnection.connect(lastBlockAdded.previousConnection);
          // lastBlockAdded.nextConnection.connect(secondUpperConnection);
          Blockly.fireUiEvent(window, 'resize');
        }
      }
    } else {
      console.log('insertBlockBefore',insertBlockBefore);
      if(topBlocks.length > 1) {
        var lastBlockAdded = topBlocks[topBlocks.length-1];
        if(lastBlockAdded.outputConnection !== null) {
          console.log("Just leaving this block unconnected, since it's an output.",lastBlockAdded);
          return;
        }
        if(selectedBlock.previousConnection === null) return;
        if(selectedBlock.previousConnection.targetConnection === null) {
          selectedBlock.previousConnection.connect(lastBlockAdded.nextConnection);
        } else {
          console.log("w000t.... complicated stuff.");
          return;
        }
      }
    }
}
}

/*IS THIS USED???*/
function var_to_number(varStr){
 return (1*varStr.substring(1,varStr.length-1));
}

