
Blockly.JavaScript.polygons_sketch = function() {
  var code = this.getTitleValue('code') || '[0,0],[10,0],[0,10]';
  code = code.replace(/\/\*[^\*]*\*\//g,"");
  code = code.replace(/polygon\(\[/g,""); // remove polygon([ from string
  code = code.replace(/\]\);?/g,""); // remove ]); from string

  code = 'fromPoints(['+code+']).translate(['+cursor_move[0]+','+cursor_move[1]+','+cursor_move[2]+']).rotate(['+cursor_rot[0]+','+cursor_rot[1]+','+cursor_rot[2]+'])';

  if(codeLanguage == 'vol0.1')
    return '';
  if(codeLanguage == 'coffeescad0.1') {
    return code;
  }
  else
  return code; //[code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Language.polygons_sketch = {
  category: ucfirst(LANG.polygons),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle("Sketch");
    this.appendDummyInput()
        .appendTitle("coordinate code")
        .appendTitle(new Blockly.FieldTextInput('[0,0],[10,0],[0,10]',
        ""), 'code');
    this.setTooltip('A a polyline from a sketch.');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};
matchPhrases['sketch'] = function(args){
  console.log('before',args);
  argsStr = args.join(' ');
  argsStr = argsStr.replace(/^sketch /,'');
  argsStr = argsStr.replace('] ,','],');
  args = argsStr.split(';');
  console.log('after',args);
  var arg1 = '';
  var arg2 = '';
  var str = '';
  var curBlock = '';
  if(!args || args.length===0) {
    return alert("needs a path");
  }

  if(args.length === 1) {
    str = '<block inline="true" type="polygons_extrude">'+
'        <statement name="shapeToExtrude">'+
'          <block type="polygons_sketch">'+
'            <title name="code">'+args[0]+'</title>'+
'          </block>'+
'        </statement>'+
'      </block>';
  }

  if(args && args.length>1) {
    for(var i=0; i<args.length;i++) {
    if(args[i].trim().length===0)
      continue;
    var hasNextStr = (i === args.length? "" : "<next>");
      str = '<block inline="true" type="polygons_extrude">'+
      '        <statement name="shapeToExtrude">'+
      '          <block type="polygons_sketch">'+
      '            <title name="code">'+args[i]+'</title>'+
      '          </block>'+
      '        </statement>'+hasNextStr+str+
      '      </block>';
    }
  }

  str = '<xml>'+str+'</xml>';
  createBlockAtCursor(str);
};

Blockly.JavaScript.polygons_point = function() {
  var tX = var_to_number(Blockly.JavaScript.valueToCode(this, 'tX', Blockly.JavaScript.ORDER_ATOMIC)) || 0;
  var tY = var_to_number(Blockly.JavaScript.valueToCode(this, 'tY', Blockly.JavaScript.ORDER_ATOMIC)) || 0;
  var code = '';
  if(codeLanguage == 'vol0.1')
    return '';
  if(codeLanguage == 'coffeescad0.1') {
    return '['+tX+','+tY+'];';
  }
  else
  return code; //[code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Language.polygons_point = {
  category: ucfirst(LANG.polygons),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle("Point");
    this.appendValueInput("tX")
        .appendTitle("tX");
    this.appendValueInput("tY")
        .appendTitle("tY");
    this.setTooltip('A point in a polyline.');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript.polygons_polygon = function() {
  var pointListStr = Blockly.JavaScript.statementToCode(this, 'pointList');
  pointList = pointListStr.split(';');
  var code = '';
  while(pointList.length > 2) {
    var str = pointList.shift().trim();
    if(str === '') continue; // skip empty item
    code += str.trim()+",";
  }
  code = 'fromPoints(['+code+pointList.shift().trim()+']).translate(['+cursor_move[0]+','+cursor_move[1]+','+cursor_move[2]+']).rotate(['+cursor_rot[0]+','+cursor_rot[1]+','+cursor_rot[2]+'])';
  console.log('points:',pointList,'code',code);
  if(codeLanguage == 'vol0.1')
    return '';
  if(codeLanguage == 'coffeescad0.1') {
    return code;
    // return '['+tX+','+tY+']';
  }
  else
  return code; //[code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Language.polygons_polygon = {
  category: ucfirst(LANG.polygons),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldTextInput("polyline"), "polyName");
    this.appendStatementInput("pointList")
        // .setCheck(["Shape", "Assembly"])
        .appendTitle("Points");
    this.setTooltip('Make a shape, by creating a connected series of lines based on a list of 2D points.');
    this.setMutator(new Blockly.Mutator(['polygons_triangle','polygons_point']));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    /*
    var xml = Blockly.Xml.textToDom(
      '<xml>' +
      '  <block type="polygons_point" inline="true"><next>' +
      '  <block type="polygons_point" inline="true"><next><block type="polygons_point" inline="true">' +
      '  </block></next></block></next></block>' +
      '</xml>');*/

    /*
<block type="polygons_triangle" x="25" y="100"><title name="polyName">triangle</title>
<statement name="NAME"><block type="polygons_point" inline="true"><next>
<block type="polygons_point" inline="true"><next><block type="polygons_point" inline="true">
</block></next></block></next></block></statement></block>
<block type="plane_set_seats" inline="false" x="25" y="100">
</block>

    */
    // Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);

  },
  decompose: function(workspace) {
    var ifBlock = new Blockly.Block(workspace, 'polygons_polygon');
    ifBlock.initSvg();
    return ifBlock;
  }
};
matchPhrases['triangle [10]'] = function(args){
  var arg1 = 10;
  if(args && args.length>1) {var i = 1;
    arg1 = args[i++];
  }
  createBlockAtCursor('<xml><block type="polygons_polygon" x="66" y="27"><title name="polyName">polyline</title><statement name="pointList"><block type="polygons_point" inline="true"><next><block type="polygons_point" inline="true"><value name="tX"><block type="math_number"><title name="NUM">'+arg1+'</title></block></value><next><block type="polygons_point" inline="true"><value name="tY"><block type="math_number"><title name="NUM">'+arg1+'</title></block></value></block></next></block></next></block></statement></block></xml>');
};



Blockly.JavaScript.polygons_extrude = function() {
  var polyline = Blockly.JavaScript.statementToCode(this, 'shapeToExtrude');
  var extrudeX = var_to_number(Blockly.JavaScript.valueToCode(this, 'extrudeX', Blockly.JavaScript.ORDER_NONE)) || 0;
  var extrudeY = var_to_number(Blockly.JavaScript.valueToCode(this, 'extrudeY', Blockly.JavaScript.ORDER_NONE)) || 0;
  var extrudeZ = var_to_number(Blockly.JavaScript.valueToCode(this, 'extrudeZ', Blockly.JavaScript.ORDER_NONE)) || 10;
  var code = '';
  var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '';
  code = polyline+'.extrude({offset:['+extrudeX+','+extrudeY+','+extrudeZ+']})'+selectedStr+';';
  if(codeLanguage == 'vol0.1')
    return '';
  if(codeLanguage == 'coffeescad0.1') {
    return code;
  }
  else
  return code; //[code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Language.polygons_extrude = {
  category: ucfirst(LANG.polygons),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle("Extrude shape");
    this.appendValueInput("extrudeX")
        .setCheck(Number)
        .appendTitle("X");
    this.appendValueInput("extrudeY")
        .setCheck(Number)
        .appendTitle("Y");
    this.appendValueInput("extrudeZ")
        .setCheck(Number)
        .appendTitle("Z (thickness)");
    this.appendStatementInput("shapeToExtrude")
        .appendTitle("Polyline to expand");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Make a 3D shape from a 2D shape by giving it thickness.');
  }
};
matchPhrases['prism'] = function(args){
  var arg1 = 10;
  if(args && args.length>1) {var i = 1;
    arg1 = args[i++];
  }
  createBlockAtCursor('<xml><block type="polygons_extrude" inline="true" x="-10" y="16"><value name="extrudeZ"><block type="math_number"><title name="NUM">20</title></block></value><statement name="shapeToExtrude"><block type="polygons_polygon"><title name="polyName">polyline</title><statement name="pointList"><block type="polygons_point" inline="true"><next><block type="polygons_point" inline="true"><value name="tX"><block type="math_number"><title name="NUM">'+arg1+'</title></block></value><next><block type="polygons_point" inline="true"><value name="tY"><block type="math_number"><title name="NUM">'+arg1+'</title></block></value></block></next></block></next></block></statement></block></statement></block></xml>');
};


Blockly.JavaScript.polygons_expand = function() {
  var polyline = Blockly.JavaScript.statementToCode(this, 'shapeToExpand');
  var expandX = var_to_number(Blockly.JavaScript.valueToCode(this, 'expandX', Blockly.JavaScript.ORDER_NONE)) || 1;
  var expandY = var_to_number(Blockly.JavaScript.valueToCode(this, 'expandY', Blockly.JavaScript.ORDER_NONE)) || 1;
  var code = '';
  code = polyline+'.expand('+expandX+','+expandY+')';
  console.log('code',code,'expandX blockly:',Blockly.JavaScript.valueToCode(this, 'expandX', Blockly.JavaScript.ORDER_ATOMIC));
  if(codeLanguage == 'vol0.1')
    return '';
  if(codeLanguage == 'coffeescad0.1') {
    return code;
  }
  else
  return code; //[code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Language.polygons_expand = {
  category: ucfirst(LANG.polygons),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle("Expand shape");
    this.appendValueInput("expandX")
        .setCheck(Number)
        .appendTitle("X");
    this.appendValueInput("expandY")
        .setCheck(Number)
        .appendTitle("Y");
    this.appendStatementInput("shapeToExpand")
        .appendTitle("Polyline to expand");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Make a shape, by creating a connected series of lines based on a list of 2D points.');
  }
};


/*
Blockly.JavaScript.polygons_triangle = function() {
};
*/
