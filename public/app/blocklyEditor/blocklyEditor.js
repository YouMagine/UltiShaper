

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
      code = '<'+'?xml version="1.0" ?'+'>\n <VOL VersionMajor="1" VersionMinor="2">\n     <Parameters />\n     <uformia.base.Model.20110605 Name="43">';
      code += Blockly.Generator.workspaceToCode('JavaScript');
      
       code += '\n     </uformia.base.Model.20110605>\n </VOL>';
    }
    if(codeLanguage == 'scad') {
      code = Blockly.Generator.workspaceToCode('JavaScript');
      code = "$fs=0.4;\n$fa=5;\n"+code;
    }
    document.getElementById('codearea').value = code;
    if(app2 && app2.loadCode)
      app2.loadCode(code);
}


/*IS THIS USED???*/
function var_to_number(varStr){
 return (1*varStr.substring(1,varStr.length-1));
}
