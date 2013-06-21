// TODO: klikken in het midden van een leeg inputstuk moet een logisch inputstuk opleveren.
// evt dropdown met suggesties. 
// Afmeting van 0 is net geldig. 
// niet alleen slepen naar prullebak, ook geselecteerde item kunnen deleten door op prullebak
// remove 'modus', wisselen net als de cursor
// lesson constructor maken: // record steps, annotate them (save diffs of XML desc.)
// hotkeys: (/ of ? opent cursor in search box)
/* zoals een search:
  #1 = number, nu[mber]
  + is add
  - is subtract
  cu = cube
  cy = cylinder
  pa = part
  inc[lude] external part
  if?
  mo[ve]
  ro[tate]
  input field

  MRU = most recently used
  

enter = autocomplete

http://code.google.com/p/blockly/wiki/Toolbox block groups!!! they have settings already in there!!

check http://www.k-3d.org/wiki/User_Documentation

AST van openscad gebruiken
*/

Blockly.JavaScript.assembly_part = function() {
  var name = this.getTitleValue('PARTNAME');
  var addShapes = Blockly.JavaScript.statementToCode(this, 'SHAPESADD');
  var removeShapes = Blockly.JavaScript.statementToCode(this, 'SHAPESREMOVE');
  var booleanType = this.getTitleValue('booleanType');
  var scaleStr = '.scale(['+cursor_scale[0]+','+cursor_scale[1]+','+cursor_scale[2]+'])';
  if(codeLanguage == 'coffeescad0.1') {
    code = ''; var coffeescadOperation = '';
    var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '.color(colors.unselected)';
    switch(booleanType){
      case 'union':
        coffeescadOperation = 'union';break;
      case 'difference':
        coffeescadOperation = 'subtract';break;
      case 'intersection':
        coffeescadOperation = 'intersect';break;
    }
    partName = "newPart"+Math.round(Math.random()*100000);
    addShapesList = addShapes.split(';');
    codeAdd = ''; isFirstPart = true;
    console.log('Adding:',addShapesList,addShapesList.length);
    partNameRegEx =/newPart[0-9]{1,5}/;
    while(addShapesList.length > 1) {
      str = addShapesList.shift().trim();
      if(str.substring(0,8) == '# Part: '){
        console.log("Holy cow... this one has nested content...");
        nestedPartName = partNameRegEx.exec(str)[0];
        partName = nestedPartName;
        partWithoutAddingStr = partWithoutAddingRegEx.exec(str)[0];
        str = str.replace(new RegExp( "assembly.add.*", "g" ),"");

        codeAdd += "\n"+str;

        console.log("Adding nested part ("+nestedPartName+") to this part instead of to assembly:",str);
        continue;
      }
      console.log("Add... what to do with str:",str);
      if(str.trim().substring(0,4) != 'new ') {
        codeAdd += "\n"+str;
        continue;
      }
      if(isFirstPart === true)
        codeAdd += "\n"+partName+" = "+str;
      else
        codeAdd += "\n"+partName+".union("+str+")";
      isFirstPart = false;
    }

    removeShapesList = removeShapes.split(';');
    console.log('Removing:',removeShapesList);
    codeRemove = '';ghostParts = '';isFirstPart = true;
    boolPartsName = "boolParts"+Math.round(Math.random()*100000);
    while(removeShapesList.length > 1) {
      console.log('Removelist left:',removeShapesList,'codeRemove:',codeRemove);
      str = removeShapesList.shift().trim();
      if(str.substring(0,8) == '# Part: '){
        console.log("Holy cow... this bool has nested content...",str);
        nestedPartName = partNameRegEx.exec(str)[0];
        partWithoutAddingStr = partWithoutAddingRegEx.exec(str)[0];
        str = str.replace(new RegExp( "assembly.add.*", "g" ),"");

        codeAdd += "\n"+str;
        if(isFirstPart === true)
          codeAdd += "\n"+boolPartsName+" = "+nestedPartName;
        else
          codeAdd += "\n"+boolPartsName+".add(nestedPartName)";
        console.log("What to do with nested part ("+nestedPartName+"):",str);
        continue;
      }
      if(str.trim().substring(0,4) != 'new ')
      {
        codeRemove += "\n"+str;
        continue;
      }
      if(isFirstPart === true)
        codeRemove += "\n"+boolPartsName+" = "+str;
      else
        codeRemove += "\n"+boolPartsName+".union("+str+")";
      if(coffeescadOperation == 'subtract') {
       ghostParts += "\nassembly.add("+str+".color(colors.subtracting))";
      }
      isFirstPart = false;
    }
    codeRemove += "\n"+partName+"."+coffeescadOperation+"("+boolPartsName+")";
    code = "\n# Part: "+name+"\n"+codeAdd + "\n"+codeRemove;
    code += "\nassembly.add("+partName+");";
   code += "\n# Ghosts:"+ghostParts;
    console.log({code:code, add: codeAdd, remove: codeRemove, length: removeShapesList.length});
    code = code.replace(new RegExp( "\n\\s+", "g" ),"\n");
    return code.trim();
  }
};


// Shape Boolean Operators
Blockly.Language.assembly_part = {
  category: ucfirst(getLang('assembly')),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(65);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldImage("assets/img/assembly.png", 27, 24))
        .appendTitle("Part").appendTitle(new Blockly.FieldTextInput('Part name 1'), 'PARTNAME');
    this.appendStatementInput("SHAPESADD")
        // .setCheck(["Shape", "Assembly"])
        .appendTitle("Base part(s)");
// this.appendStatementInput("boolType")
    this.appendStatementInput("SHAPESREMOVE")
        .appendTitle(new Blockly.FieldDropdown([["Subtract", "difference"], ["Combine", "union"], ["Overlapping", "intersection"]]), "booleanType")
        // .setCheck(["Shape", "Assembly"])
        .appendTitle("part(s)");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    // this.setPreviousStatement(true, ["Shape", "Assembly"]);
    this.setNextStatement(true);
    this.setTooltip('Combine shapes, remove a shape from another shape or keep the overlapping volume.');
  }
};



Blockly.JavaScript.shape_sphere = function() {
  var value_diameter = Blockly.JavaScript.valueToCode(this, 'diameter', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var scaleStr = '.scale(['+cursor_scale[0]+','+cursor_scale[1]+','+cursor_scale[2]+'])';
  // todo: assemble javaScript into code variable.
  // var code = 'alert(\'sphere r = '+value_diameter+')';
  // todo: change order_none to the correct strength.
  // return [code, Blockly.JavaScript.ORDER_NONE];
  
  // console.log({isSelected: blockIsSelected(this,'bubbletoshape')});
  if(codeLanguage == 'vol0.1')
    return '<uformia.base.Sphere.20110605 Name="43a" centerX="0" centerY="0" centerZ="0" radiusX="'+value_diameter+'" radiusY="'+value_diameter+'" radiusZ="'+value_diameter+'"></uformia.base.Sphere.20110605>';
  if(codeLanguage == 'coffeescad0.1') {
    var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '.color(colors.unselected)';
    return 'new Sphere({d:'+value_diameter+'}).translate(tr).rotate(rot)'+selectedStr+scaleStr+';\n';
  }
  else
    return 'sphere(r='+value_diameter+');\n';
};
Blockly.Language.shape_sphere = {
  category: ucfirst(getLang('shape')),
  helpUrl: 'http://wiki.ultimaker.com/',
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldImage("assets/img/shape_sphere.png", 25, 25))
        .appendTitle(ucfirst(LANG.sphere));
    this.appendValueInput("diameter")
        .setCheck(Number)
        .appendTitle(LANG.diameter);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Creates a sphere');
  }
};
matchPhrases['sphere [d=10]'] = function(args){
  var d = 10;
  if(args && args.length>1) {
    d = args[1];
  }
  if(!isNaN(d))
    createBlockAtCursor('<block type="shape_sphere"><value name="diameter"><block type="math_number"><title name="NUM">'+Number(d)+'</title></block></value></block>');
};

Blockly.JavaScript.shape_cube = function() {
  var value_width = Blockly.JavaScript.valueToCode(this, 'width', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var value_depth = Blockly.JavaScript.valueToCode(this, 'depth', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var value_height = Blockly.JavaScript.valueToCode(this, 'height', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var center_object = this.getTitleValue('CENTEROBJECT') == 'TRUE';
  var scaleStr = '.scale(['+cursor_scale[0]+','+cursor_scale[1]+','+cursor_scale[2]+'])';
  var centerStr = '';
  if(center_object) centerStr = ',center=true';
  // todo: assemble javascript into code variable.
  var code = 'cube(['+value_width+','+value_depth+','+value_height+']'+centerStr+');\n';
  // todo: change order_none to the correct strength.
  // code = 'test';
  if(codeLanguage == 'vol0.1')
    return '<uformia.base.Sphere.20110605 Name="43a" centerX="0" centerY="0" centerZ="0" radiusX<uformia.base.Box.20110605 Name="43a (1)" centerX="0" centerY="0" centerZ="0" dimensionX="'+value_width+'" dimensionY="'+value_depth+'" dimensionZ="'+value_height+'"></uformia.base.Box.20110605>';
  if(codeLanguage == 'coffeescad0.1') {
    var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '.color(colors.unselected)';
    if(center_object) centerStr=',center:[0,0,0]';
    return 'new Cube({size:['+value_width+','+value_depth+','+value_height+']'+centerStr+'}).translate(tr).rotate(rot)'+scaleStr+selectedStr+';\n';
  }
  else
  return code; //[code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Language.shape_cube = {
  category: ucfirst(getLang('shape')),
  helpUrl: 'http://wiki.ultimaker.com/',
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldImage("assets/img/shape_cube.png", 25, 25))
        .appendTitle(ucfirst(LANG.cube));
    this.appendValueInput("width")
        .setCheck(Number)
        .appendTitle(LANG.width);
    this.appendValueInput("depth")
        .setCheck(Number)
        .appendTitle(LANG['depth']);
    this.appendValueInput("height")
        .setCheck(Number)
        .appendTitle(LANG.height);
    this.appendDummyInput()
        .appendTitle(LANG.center)
        .appendTitle(new Blockly.FieldCheckbox("TRUE"), "CENTEROBJECT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Creates a cube');
  }
};
matchPhrases['cube w=[10],d=[10],h=[10]'] = function(args){
  var x = 10, y = 10, z = 10, i = 1;
  if(args && args.length>1) { i = 1;
    x = args[i]; y = args[i]; z = args[i];
  }
  if(args && args.length>2) { i = 1;
    x = args[i++]; y = args[i++];
  }
  if(args && args.length>3) { i = 1;
    x = args[i++]; y = args[i++]; z = args[i++];
  }
  createBlockAtCursor('<xml><block type="shape_cube"><title name="CENTEROBJECT">TRUE</title><value name="width"><block type="math_number"><title name="NUM">'+x+'</title></block></value><value name="depth"><block type="math_number"><title name="NUM">'+y+'</title></block></value><value name="height"><block type="math_number"><title name="NUM">'+z+'</title></block></value></block></xml>');
};

Blockly.JavaScript.shape_cylinder = function() {
  var value_diameter1 = Blockly.JavaScript.valueToCode(this, 'diameter1', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var value_height = Blockly.JavaScript.valueToCode(this, 'height', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  // var center_object = this.getTitleValue('CENTEROBJECT') == 'TRUE';
  var scaleStr = '.scale(['+cursor_scale[0]+','+cursor_scale[1]+','+cursor_scale[2]+'])';
  var centerStr = '';
  // if(center_object) centerStr = ',center=true';
  // todo: assemble javaScript into code variable.
  var code = 'cylinder(r=0.5*'+value_diameter1+',h='+value_height+centerStr+');';
  // todo: change order_none to the correct strength.
  if(codeLanguage == 'vol0.1')
    return '';
  if(codeLanguage == 'coffeescad0.1') {
    var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '.color(colors.unselected)';
    // if(center_object) centerStr=',center:[0,0,0]';
    return 'new Cylinder({d:'+value_diameter1+',h:'+value_height+'}).translate(['+cursor_move[0]+','+cursor_move[1]+','+cursor_move[2]+']).rotate(['+cursor_rot[0]+','+cursor_rot[1]+','+cursor_rot[2]+'])'+scaleStr+selectedStr+';';
  } else return code;  // scad
};
Blockly.Language.shape_cylinder = {
  category: ucfirst(getLang('shape')),
  helpUrl: 'http://wiki.ultimaker.com/',
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldImage("assets/img/shape_cylinder.png", 25, 25))
        .appendTitle("Cylinder");
    this.appendValueInput("diameter1")
        .setCheck(Number)
        .appendTitle(LANG.diameter);
    this.appendValueInput("height")
        .appendTitle("height")
        .setCheck(Number)
        .appendTitle(LANG.hoogte);
    // this.appendDummyInput()
        // .appendTitle(LANG.center)
        // .appendTitle(new Blockly.FieldCheckbox("TRUE"), "CENTEROBJECT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Creates a cylinder');
  }
};
matchPhrases['cylinder [d=10] [h=10]'] = function(args){
  var d = 10, h = 10, i = 1;
  if(args && args.length>1) { i = 1;
    d = args[i++];
  }
  if(args && args.length>2) { i = 1;
    d = args[i++]; h = args[i++];
  }
  createBlockAtCursor('<xml><block type="shape_cylinder"><value name="diameter1"><block type="math_number"><title name="NUM">'+d+'</title></block></value><value name="height"><block type="math_number"><title name="NUM">'+h+'</title></block></value></block></xml>');
};


Blockly.JavaScript.shape_cone = function() {
  var value_diameter1 = Blockly.JavaScript.valueToCode(this, 'diameter1', Blockly.JavaScript.ORDER_ATOMIC) || 2;
  var value_diameter2 = Blockly.JavaScript.valueToCode(this, 'diameter2', Blockly.JavaScript.ORDER_ATOMIC) || 12;
  var value_height = Blockly.JavaScript.valueToCode(this, 'height', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var center_object = this.getTitleValue('CENTEROBJECT') == 'TRUE';
  var scaleStr = '.scale(['+cursor_scale[0]+','+cursor_scale[1]+','+cursor_scale[2]+'])';
  var centerStr = '';
  if(center_object) centerStr = ',center=true';
  // todo: assemble javaScript into code variable.
  var code = 'cylinder(r1=0.5*'+value_diameter1+',r2=0.5*'+value_diameter2+',h='+value_height+centerStr+');';
  // todo: change order_none to the correct strength.
  if(codeLanguage == 'coffeescad0.1') {
    if(center_object) centerStr=',center:[0,0,0]';
    var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '.color(colors.unselected)';
    return 'new Cylinder({d1:'+value_diameter1+',d2:'+value_diameter2+',h:'+value_height+'}'+centerStr+')'+scaleStr+selectedStr+';';
  }
  if(codeLanguage == 'vol0.1')
    return '';
  else return code; // scad
};
Blockly.Language.shape_cone = {
  category: ucfirst(getLang('shape')),
  helpUrl: 'http://wiki.ultimaker.com/',
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldImage("assets/img/shape_cone.png", 25, 25))
        .appendTitle(ucfirst(LANG.cone));
    this.appendValueInput("diameter1")
        .setCheck(Number)
        .appendTitle(LANG.radius+" (top)");
    this.appendValueInput("diameter2")
        .setCheck(Number)
        .appendTitle(LANG.radius+" (bottom)");
    this.appendValueInput("height")
        .setCheck(Number)
        .appendTitle(LANG.height);
    this.appendDummyInput()
        .appendTitle(LANG.center)
        .appendTitle(new Blockly.FieldCheckbox("TRUE"), "CENTEROBJECT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Creates a cone');
  }
};
matchPhrases['cone [d1=12] [d2=5] [h=10]'] = function(args){
  var d1 = 10, d2 = 12, h = 10, i = 1;
  if(args && args.length>3) { i = 1;
    d1 = args[i++];
    d2 = args[i++];
    h = args[i++];
  }
  if(args && args.length>2) { i = 1;
    d1 = args[i++];
    d2 = args[i++];
  }
  if(args && args.length>1) { i = 1;
    d1 = args[i++];
  }
  createBlockAtCursor('<xml><block type="shape_cone"><title name="CENTEROBJECT">TRUE</title><value name="diameter1"><block type="math_number"><title name="NUM">'+d1+'</title></block></value><value name="diameter2"><block type="math_number"><title name="NUM">'+d2+'</title></block></value><value name="height"><block type="math_number"><title name="NUM">'+h+'</title></block></value></block></xml>');
};









//////////////// blocks with no code generators (yet) ///////////////////////


