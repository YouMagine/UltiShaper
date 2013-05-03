Blockly.JavaScript.cursor_rotate = function() {
  var name = this.getTitleValue('NAME');
  var rX = var_to_number(Blockly.JavaScript.valueToCode(this, 'rX', Blockly.JavaScript.ORDER_ATOMIC)) || 0;
  var rY = var_to_number(Blockly.JavaScript.valueToCode(this, 'rY', Blockly.JavaScript.ORDER_ATOMIC)) || 0;
  var rZ = var_to_number(Blockly.JavaScript.valueToCode(this, 'rZ', Blockly.JavaScript.ORDER_ATOMIC)) || 0;
  // todo: assemble javaScript into code variable.
  var code = '';
  if(name == 'rotateTo')
    cursor_rot= [0,0,0];
  cursor_rot[0] = cursor_rot[0] + rX;
  console.log('type:',name,'rX:',rX,'cursor_rot',cursor_rot,'from blockly:',var_to_number(Blockly.JavaScript.valueToCode(this, 'rX', Blockly.JavaScript.ORDER_ATOMIC)));
  cursor_rot[1] = cursor_rot[1] + rY;
  cursor_rot[2] = cursor_rot[2] + rZ;
  // todo: change order_none to the correct strength.
  if(codeLanguage == 'coffeescad0.1') {
    return '';//rot=['+rX+','+rY+','+rZ+'];';
  }
  if(codeLanguage == 'vol0.1')
    return '';
  else return code; // scad
};
Blockly.Language.cursor_rotate = {
  category: ucfirst(getLang('cursor')),
  helpUrl: 'http://wiki.ultimaker.com/',
  init: function() {
    this.setColour(65);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldImage("assets/img/rotate.png", 32, 24))
        // .appendTitle(new Blockly.FieldImage("../webgl/shape_cube.png", 25, 25))
        .appendTitle(new Blockly.FieldDropdown([[ucfirst(getLang('rotateBy')), "rotateBy"], [ucfirst(getLang('rotateTo')), "rotateTo"]]), "NAME");
    this.appendValueInput("rX")
        .setCheck(Number)
        .appendTitle("rX");
    this.appendValueInput("rY")
        .setCheck(Number)
        .appendTitle("rY");
    this.appendValueInput("rZ")
        .setCheck(Number)
        .appendTitle("rZ");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Rotate');
  }
};
matchPhrases['rotate [x=0] [y=0] [z=45]'] = function(args){
  var x = 0, y = 0, z = 45;
  if(args && args.length>3) {
    x = args[1]; y = args[2]; z = args[3];
  }
  if(args && args.length==3) {
    x = args[1]; y = args[2]; z = 0;
  }
  if(args && args.length==2) {
    x = args[1]; y = 0; z = 0;
  }
  insertBlockBefore = true;
  removePreviousCursorCmdBlockIf('cursor_rotate');
  createBlockAtCursor('<block type="cursor_rotate"><title name="NAME">rotateBy</title><value name="rX"><block type="math_number"><title name="NUM">'+x+'</title></block></value><value name="rY"><block type="math_number"><title name="NUM">'+y+'</title></block></value><value name="rZ"><block type="math_number"><title name="NUM">'+z+'</title></block></value></block>');
};


Blockly.JavaScript.cursor_move = function() {
  var name = this.getTitleValue('NAME');
  var tX = var_to_number(Blockly.JavaScript.valueToCode(this, 'tX', Blockly.JavaScript.ORDER_ATOMIC)) || 0;
  var tY = var_to_number(Blockly.JavaScript.valueToCode(this, 'tY', Blockly.JavaScript.ORDER_ATOMIC)) || 0;
  var tZ = var_to_number(Blockly.JavaScript.valueToCode(this, 'tZ', Blockly.JavaScript.ORDER_ATOMIC)) || 0;
  // todo: assemble javaScript into code variable.
  var code = '';
  console.log(name+' pre ',cursor_move);
  if(name == 'moveTo')
    cursor_move = [0,0,0];
  cursor_move[0] = cursor_move[0] + tX;
  cursor_move[1] = cursor_move[1] + tY;
  cursor_move[2] = cursor_move[2] + tZ;
  console.log(name+' post ',cursor_move);
  // console.log('type:',name,'tX:',tX,'cursor_move',cursor_move);
  // todo: change order_none to the correct strength.
  if(codeLanguage == 'coffeescad0.1') {
    return '';//rot=['+rX+','+rY+','+rZ+'];';
  }
  if(codeLanguage == 'vol0.1')
    return '';
  else return code; // scad
};
Blockly.Language.cursor_move = {
  category: ucfirst(getLang('cursor')),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(65);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldImage("assets/img/move.png", 29, 24))
        .appendTitle(new Blockly.FieldDropdown([[ucfirst(getLang('moveBy')), "moveBy"], [ucfirst(getLang('moveTo')), "moveTo"]]), "NAME");
    this.appendValueInput("tX")
        .appendTitle("X");
    this.appendValueInput("tY")
        .appendTitle("Y");
    this.appendValueInput("tZ")
        .appendTitle("Z");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
matchPhrases['move [x=10] [y=0] [z=0]'] = function(args){
  var x = 10, y = 0, z = 0;
  if(args && args.length>3) {
    x = args[1]; y = args[2]; z = args[3];
  }
  if(args && args.length>2) { i = 1;
    x = args[1]; y = args[2];
  }
  if(args && args.length>1) {
    x = args[1];
  }
  insertBlockBefore = true;
  removePreviousCursorCmdBlockIf('cursor_move');
  createBlockAtCursor('<block type="cursor_move" inline="true"><title name="NAME">moveBy</title><value name="tX"><block type="math_number"><title name="NUM">'+x+'</title></block></value><value name="tY"><block type="math_number"><title name="NUM">'+y+'</title></block></value><value name="tZ"><block type="math_number"><title name="NUM">'+z+'</title></block></value></block>');
};



Blockly.JavaScript.cursor_scale = function() {
  var name = this.getTitleValue('NAME');
  var X = var_to_number(Blockly.JavaScript.valueToCode(this, 'X', Blockly.JavaScript.ORDER_ATOMIC)) || 1;
  var Y = var_to_number(Blockly.JavaScript.valueToCode(this, 'Y', Blockly.JavaScript.ORDER_ATOMIC)) || 1;
  var Z = var_to_number(Blockly.JavaScript.valueToCode(this, 'Z', Blockly.JavaScript.ORDER_ATOMIC)) || 1;
  // todo: assemble javaScript into code variable.
  cursor_scale = [X,Y,Z];
  if(codeLanguage == 'coffeescad0.1') {
    return '';//rot=['+rX+','+rY+','+rZ+'];';
  }
  if(codeLanguage == 'vol0.1')
    return '';
  else return code; // scad
};
Blockly.Language.cursor_scale = {
  category: ucfirst(getLang('cursor')),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(65);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldImage("assets/img/scale.png", 27, 24))
        .appendTitle(getLang("Scale"));
    this.appendValueInput("X")
        .appendTitle("X");
    this.appendValueInput("Y")
        .appendTitle("Y");
    this.appendValueInput("Z")
        .appendTitle("Z");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
matchPhrases['scale [x=1] [y=1] [z=1]'] = function(args){
  var x = 1, y = 1, z = 1;
  if(args && args.length>3) {
    x = args[1]; y = args[2]; z = args[3];
  }
  if(args && args.length>2) { i = 1;
    x = args[1]; y = args[2];
  }
  if(args && args.length == 2) {
    x = args[1]; y = args[1]; z = args[1];
  }
  insertBlockBefore = true;
  removePreviousCursorCmdBlockIf('cursor_scale');
  createBlockAtCursor('<block type="cursor_scale" inline="true"><value name="X"><block type="math_number"><title name="NUM">'+x+'</title></block></value><value name="Y"><block type="math_number"><title name="NUM">'+y+'</title></block></value><value name="Z"><block type="math_number"><title name="NUM">'+z+'</title></block></value></block>');
};

function removePreviousCursorCmdBlockIf(blockType) {
  if(typeof Blockly.selected === "object" && Blockly.selected !== null)
  if (Blockly.selected.category.toLowerCase() === getLang('cursor').toLowerCase() && Blockly.selected.type === blockType) {
    console.log("replace the cursor cmd of ",Blockly.selected);
    // figure out the next connected block
    var nextBlock = null;
    if(Blockly.selected.nextConnection && Blockly.selected.nextConnection.targetConnection && Blockly.selected.nextConnection.targetConnection.sourceBlock_) {
      nextBlock = Blockly.selected.nextConnection.targetConnection.sourceBlock_;
    }
    // disconnect and remove the current cursor command
      Blockly.selected.dispose(true, false);
    // select the next connected block
    if(nextBlock) {
      nextBlock.select();
    }
  }
}
