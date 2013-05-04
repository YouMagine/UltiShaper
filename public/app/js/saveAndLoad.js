var autoSave = false;
var autoSaveInitial = true;
var autoSaveInterval = 2000;
var storageApiEndpoint = '/shapes.json';
var prevXML = '';


function doAutoSave() {
  var xml = getXML();
  if(xml == prevXML) 
    return; // no change, no save.
  prevXML = xml;
  if(prevXML == '') 
    return; // empty, no save.
  if(autoSave == true) {
    console.log('autosaving... (a change was made)');
    saveCode();
  }
}

function changeAutoSave(changeTo) {
  autoSave = (changeTo == '1');
}

/*
 window.setTimeout(function(){
    $('#inputPane').hide();
    myUpdateFunction();
    // close all other windows.
    $('div.ui-dialog a.ui-dialog-titlebar-close').click();
  }, 1500);
  window.setInterval(doAutoSave,autoSaveInterval);
  loadMatches('shapes'); // load defines, etc.
*/

function saveCode(name,saveType) {
  if(!name)
    name = 'autosave';
  if(!saveType) 
    saveType = 'workspace'; // otherwise, it could be a definition (e.g. define cube)
  console.log("saveCode(name=",name,"saveType=",saveType,")");
  var code = getXML();//Blockly.Generator.workspaceToCode('JavaScript');
  jQuery.post(storageApiEndpoint, { shape: {name: name, xmldata: code} })
.done(function(data) {
  alert("" + data);
});
}

function getXML() {
  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var xml_text = Blockly.Xml.domToText(xml);
  return (xml_text);
}
function loadUpXML(xmlData) {
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlData);
}
function updateDefine(id,name){
  var xml = getXML();
  jQuery.ajax({
    url: '/shapes/'+id+'.json',
    type: 'PUT',
    data: { shape: {name: name, xmldata: xml } },
    success: function(data) {
      alert("" + data);
      }
  });
}

function saveDefine(name){
  var xml = getXML();
  jQuery.ajax({
    url: '/shapes.json',
    type: 'POST',
    data: {shape: {name: name, xmldata: xml } },
    success: function(data) {
      alert("" + data);
      }
  });
}

function loadMatches(type) {
  if(!type) 
    type = 'shapes';
  //first load shapes
  jQuery.get('/'+type+'/all.json', { },
    function(data){
        var shapeArr = [];
        try {
          // defines = data.global_defines;
          for(defName in data) {
            // console.log('loadShapes('+type+'):',data[defName]);
            matchPhrases[data[defName].name] = data[defName];
            shapeArr.push(data[defName].name);
          }
        } catch (e) {
          alert("Error loading "+type+" data.");
          return;
        }
      console.log('loadShapes('+type+'): '+shapeArr.join(', ')+':',data);
      // window.setTimeout('autoSave = '+tmpAutosave+';',1000);
    }, "json");
}

function loadCode(initialLoad,name,loadType) {
      console.log('loadCode()');
  // var tmpAutosave = autoSave;
  // autoSave = false;
  if(!name)
    name = 'autosave';
  if(!loadType) 
    loadType = 'workspace'; // otherwise, it could be a definition (e.g. define cube)
  if(initialLoad) 
    autoSave = autoSaveInitial;
  jQuery.get('/shapes/all.json', { "loadData": "1", type: loadType, name: name },
    function(data){
      console.log(data);
      // Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, data.data);  
      if(loadType == 'workspace') {
        console.log(data.data); 
        try {
          var xml = Blockly.Xml.textToDom(data.data);
        } catch (e) {
          alert("Error loading blocks.");
          return;
        }
        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
      }
      // window.setTimeout('autoSave = '+tmpAutosave+';',1000);
    }, "json");
}
var defines = {};
function loadInitial() {
  console.log('loadInitial()');
  jQuery.post(storageApiEndpoint, { initialLoad: '1' },
    function(data){
      console.log('loadInitial():',data);
        try {
          // defines = data.global_defines;
          for(defName in data.global_defines) {
            console.log('loadInitial():',defName);
            matchPhrases[defName] = data.global_defines[defName];
          }
          // var xml = Blockly.Xml.textToDom(data.data);
        } catch (e) {
          alert("Error loading initial data.");
          return;
        }
      // window.setTimeout('autoSave = '+tmpAutosave+';',1000);
    }, "json");
}
