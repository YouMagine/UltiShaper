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

Blockly.JavaScript.shape_sphere = function() {
 var value_radius = Blockly.JavaScript.valueToCode(this, 'radius', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  // todo: assemble javaScript into code variable.
  // var code = 'alert(\'sphere r = '+value_radius+')';
  // todo: change order_none to the correct strength.
  // return [code, Blockly.JavaScript.ORDER_NONE];
  
  // console.log({isSelected: blockIsSelected(this,'bubbletoshape')});
  if(codeLanguage == 'vol0.1')
    return '<uformia.base.Sphere.20110605 Name="43a" centerX="0" centerY="0" centerZ="0" radiusX="'+value_radius+'" radiusY="'+value_radius+'" radiusZ="'+value_radius+'"></uformia.base.Sphere.20110605>';
  if(codeLanguage == 'coffeescad0.1') {
    var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '';
    return 'new Sphere({d:'+value_radius+'}).translate(['+cursor_move[0]+','+cursor_move[1]+','+cursor_move[2]+']).rotate(['+cursor_rot[0]+','+cursor_rot[1]+','+cursor_rot[2]+'])'+selectedStr+';\n';
  }
  else
    return 'sphere(r='+value_radius+');\n';
};
Blockly.Language.shape_sphere = {
  category: ucfirst(LANG.shape),
  helpUrl: 'http://wiki.ultimaker.com/',
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldImage("assets/img/shape_sphere.png", 25, 25))
        .appendTitle(ucfirst(LANG.sphere));
    this.appendValueInput("radius")
        .setCheck(Number)
        .appendTitle(LANG.radius);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Creates a sphere');
  }
};

Blockly.JavaScript.shape_cube = function() {
  var value_width = Blockly.JavaScript.valueToCode(this, 'width', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var value_depth = Blockly.JavaScript.valueToCode(this, 'depth', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var value_height = Blockly.JavaScript.valueToCode(this, 'height', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var center_object = this.getTitleValue('CENTEROBJECT') == 'TRUE';
  var centerStr = '';
  if(center_object) centerStr = ',center=true';
  // todo: assemble javascript into code variable.
  var code = 'cube(['+value_width+','+value_depth+','+value_height+']'+centerStr+');\n';
  // todo: change order_none to the correct strength.
  // code = 'test';
  if(codeLanguage == 'vol0.1')
    return '<uformia.base.Sphere.20110605 Name="43a" centerX="0" centerY="0" centerZ="0" radiusX<uformia.base.Box.20110605 Name="43a (1)" centerX="0" centerY="0" centerZ="0" dimensionX="'+value_width+'" dimensionY="'+value_depth+'" dimensionZ="'+value_height+'"></uformia.base.Box.20110605>';
  if(codeLanguage == 'coffeescad0.1') {
    var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '';
    if(center_object) centerStr=',center:[0,0,0]';
    return 'new Cube({size:['+value_width+','+value_depth+','+value_height+']'+centerStr+'}).translate(['+cursor_move[0]+','+cursor_move[1]+','+cursor_move[2]+']).rotate(['+cursor_rot[0]+','+cursor_rot[1]+','+cursor_rot[2]+'])'+selectedStr+';\n';
  }
  else
  return code; //[code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Language.shape_cube = {
  category: ucfirst(LANG.shape),
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
        .appendTitle(LANG.depth);
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
  if(args && args.length>3) { i = 1;
    x = args[i++]; y = args[i++]; z = args[i++];
  }
  if(args && args.length>2) { i = 1;
    x = args[i++]; y = args[i++];
  }
  if(args && args.length>1) { i = 1;
    x = args[i]; y = args[i]; z = args[i];
  }
  createBlockAtCursor('<xml><block type="shape_cube"><title name="CENTEROBJECT">TRUE</title><value name="width"><block type="math_number"><title name="NUM">'+x+'</title></block></value><value name="depth"><block type="math_number"><title name="NUM">'+y+'</title></block></value><value name="height"><block type="math_number"><title name="NUM">'+z+'</title></block></value>');
};

Blockly.JavaScript.shape_cylinder = function() {
  var value_diameter1 = Blockly.JavaScript.valueToCode(this, 'diameter1', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var value_height = Blockly.JavaScript.valueToCode(this, 'height', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  // var center_object = this.getTitleValue('CENTEROBJECT') == 'TRUE';
  var centerStr = '';
  // if(center_object) centerStr = ',center=true';
  // todo: assemble javaScript into code variable.
  var code = 'cylinder(r=0.5*'+value_diameter1+',h='+value_height+centerStr+');';
  // todo: change order_none to the correct strength.
  if(codeLanguage == 'vol0.1')
    return '';
  if(codeLanguage == 'coffeescad0.1') {
    var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '';
    // if(center_object) centerStr=',center:[0,0,0]';
    return 'new Cylinder({d:'+value_diameter1+',h:'+value_height+'}).translate(['+cursor_move[0]+','+cursor_move[1]+','+cursor_move[2]+']).rotate(['+cursor_rot[0]+','+cursor_rot[1]+','+cursor_rot[2]+'])'+selectedStr+';';
  } else return code;  // scad
};
Blockly.Language.shape_cylinder = {
  category: ucfirst(LANG.shape),
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
  if(args && args.length>2) { i = 1;
    d = args[i++]; h = args[i++];
  }
  if(args && args.length>1) { i = 1;
    d = args[i++];
  }
  createBlockAtCursor('<xml><block type="shape_cylinder"><value name="diameter1"><block type="math_number"><title name="NUM">'+d+'</title></block></value><value name="height"><block type="math_number"><title name="NUM">'+h+'</title></block></value></block></xml>');
};


Blockly.JavaScript.shape_cone = function() {
  var value_diameter1 = Blockly.JavaScript.valueToCode(this, 'diameter1', Blockly.JavaScript.ORDER_ATOMIC) || 5;
  var value_diameter2 = Blockly.JavaScript.valueToCode(this, 'diameter2', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var value_height = Blockly.JavaScript.valueToCode(this, 'height', Blockly.JavaScript.ORDER_ATOMIC) || 10;
  var center_object = this.getTitleValue('CENTEROBJECT') == 'TRUE';
  var centerStr = '';
  if(center_object) centerStr = ',center=true';
  // todo: assemble javaScript into code variable.
  var code = 'cylinder(r1=0.5*'+value_diameter1+',r2=0.5*'+value_diameter2+',h='+value_height+centerStr+');';
  // todo: change order_none to the correct strength.
  if(codeLanguage == 'coffeescad0.1') {
    if(center_object) centerStr=',center:[0,0,0]';
    var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '';
    return 'new Cylinder({d1:'+value_diameter1+',d2:'+value_diameter2+',h:'+value_height+'}'+centerStr+')'+selectedStr+';';
  }
  if(codeLanguage == 'vol0.1')
    return '';
  else return code; // scad
};
Blockly.Language.shape_cone = {
  category: ucfirst(LANG.shape),
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
matchPhrases['cone d1=[12],d2=[5],h=[10]'] = function(args){
  createBlockAtCursor('<xml><block type="shape_cone"><title name="CENTEROBJECT">TRUE</title><value name="diameter1"><block type="math_number"><title name="NUM">12</title></block></value><value name="diameter2"><block type="math_number"><title name="NUM">5</title></block></value><value name="height"><block type="math_number"><title name="NUM">10</title></block></value></block></xml>');
};

Blockly.JavaScript.assembly_part = function() {
  var name = this.getTitleValue('PARTNAME');
  var addShapes = Blockly.JavaScript.statementToCode(this, 'SHAPESADD');
  var removeShapes = Blockly.JavaScript.statementToCode(this, 'SHAPESREMOVE');
  var booleanType = this.getTitleValue('booleanType');
  code = '//part block: '+name+'\n'+booleanType+'() {\n//Add\nunion(){\n'+addShapes+'\n}\n//Remove\n'+removeShapes+'\n}';
  if(codeLanguage == 'vol0.1')
    return ''; // put blend bools here
  if(codeLanguage == 'coffeescad0.1') {
    code = '';
    var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '';
    var coffeescadOperation = '';
    switch(booleanType){
      case 'union':
        coffeescadOperation = 'union';break;
      case 'difference':
        coffeescadOperation = 'subtract';break;
      case 'intersection':
        coffeescadOperation = 'intersect';break;
    }
    addShapesList = addShapes.split(';');
    var pre =''; var post='';
    while(addShapesList.length > 2) {
      var str = addShapesList.shift();
      if(str.substring(0,4)=='var ')
        continue; // skip variable assignments
      pre += str.trim()+".union("; post += ")";
    }
    codeAdd = pre+addShapesList.shift().trim()+post;
    removeShapesList = removeShapes.split(';');
    pre =''; post='';
    while(removeShapesList.length > 2) {
      pre += removeShapesList.shift().trim()+".union("; post += ")";
    }
    codeRemove = pre+removeShapesList.shift().trim()+post;
    // console.log({add: codeAdd, remove: codeRemove, length: removeShapesList.length});
    if(codeRemove.trim() === '')
      return codeAdd.trim()+selectedStr+';'; // if there's nothing to bool with, don't bool.
    else
      return codeAdd+"."+coffeescadOperation+"("+codeRemove+")"+selectedStr+";";
  }
  else return code; // scad
};
// Shape Boolean Operators
Blockly.Language.assembly_part = {
  category: ucfirst(LANG.assembly),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(65);
    this.appendDummyInput()
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








//////////////// blocks with no code generators (yet) ///////////////////////


