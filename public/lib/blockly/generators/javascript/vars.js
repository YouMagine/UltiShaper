Blockly.JavaScript.variables_set = function() {
  var name = this.getTitleValue('VAR');
  var value = this.getTitleValue('VALUE');
  var argument0 = Blockly.JavaScript.valueToCode(this, 'VALUE',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  if(codeLanguage == 'vol0.1')
    return '';
  if(codeLanguage == 'coffeescad0.1') {
    i=0;
    // Fixme: allow more than just a single var!!
    myVarValues[i] = argument0;
    // console.log({vals: myVarValues,val: value,name:name,arg:argument0});
    return '';
  }
  else
    return '//'+name+value;
};

Blockly.JavaScript.variables_get = function() {
  var name = this.getTitleValue('VAR');
  if(codeLanguage == 'vol0.1')
    return '';
  if(codeLanguage == 'coffeescad0.1') {
    i=0;
    code = myVarValues[i];
    return [code, Blockly.JavaScript.ORDER_ATOMIC];//return 12;//myVarValues[i];
  }
  else
    return '//'+name+value;
};
