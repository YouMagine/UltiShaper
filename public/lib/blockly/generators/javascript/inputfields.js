function MySliderInput(sliderType,sliderName,val,minVal,maxVal,stepIncrement) {
    this.sliderType = sliderType;
    this.sliderName = sliderName;
    this.val = val;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.stepIncrement = stepIncrement;
    this.update = function (options) {
        // this.sliderType = options.sliderType;
        this.sliderName = options.sliderName;
        // this.val = options.val || 0;
        this.minVal = options.minVal;
        this.maxVal = options.maxVal;
        this.stepIncrement = options.stepIncrement;
        return this;
    };
    this.setVal = function (val) {
        this.val = Math.max(Math.min(val,this.maxVal),this.minVal);
        return this;
    };
    this.toString = function () {
        return 'Slider with name '+this.sliderName+' and value '+this.val;
    };
}

Blockly.JavaScript.input_field_slider = function() {
    var sliderType = this.getTitleValue('sliderType') || "Unspecified";
    var sliderName = this.getTitleValue('sliderName') || "Value:";
    var minVal = this.getTitleValue('minVal') || -42;
    var maxVal = this.getTitleValue('maxVal') || 42;
    var stepIncrement = this.getTitleValue('stepIncrement') || 1;
    var code = '';
    var val = 42;
    // inputFields = $(".inputFields");
    setTimeout(function(){$('#inputPane').show();},200);

    planeSvg.initSlider(0);
    //planeSvg.setText('row1stText', 'Rows: ' + rows1st);
    planeSvg.setText('row1Text',sliderName);
    planeSvg.setText('row2Text',sliderName);
    if(typeof inputFieldValues[0] !== null)
    {
        val = inputFieldValues[0];
    }
    // if(inputFields[0]
    if(typeof mySliderInputs[0] != 'object')
        mySliderInputs[0] = new MySliderInput(sliderType,sliderName,val,minVal,maxVal,stepIncrement);
    else {
        mySliderInputs[0].update({sliderName:sliderName,minVal:minVal,maxVal: maxVal,stepIncrement:stepIncrement});
        val = mySliderInputs[0].val;
    }
    console.log(mySliderInputs[0]);
    code = ""+val;
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Language.input_field_slider = {
  category: ucfirst(getLang('inputField')),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(61);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown([["Horizontal slider", "horSlider"], ["Vertical slider", "vertSlider"], ["Depth slider", "depthSlider"], ["Hidden slider", "hiddenSlider"]]), "sliderType");
    this.appendDummyInput()
        .appendTitle("label")
        .appendTitle(new Blockly.FieldTextInput("Input:"), "sliderName");
    this.appendDummyInput()
        .appendTitle("min")
        .appendTitle(new Blockly.FieldTextInput("0"), "minVal");
    this.appendDummyInput()
        .appendTitle("max")
        .appendTitle(new Blockly.FieldTextInput("21"), "maxVal");
    this.appendDummyInput()
        .appendTitle("step size")
        .appendTitle(new Blockly.FieldTextInput("1"), "stepIncrement");
    this.appendStatementInput("NAME")
        .appendTitle("Values (optional)");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript.input_field_text = function() {
    var inputName = this.getTitleValue('inputName') || "Unspecified";
    var defaultText = this.getTitleValue('defaultText') || "My text.";
    var maxChars = this.getTitleValue('maxChars') || 20;
    var code = '';
    if(codeLanguage == 'vol0.1')
        return '<uformia.base.Sphere.20110605 Name="43a" centerX="0" centerY="0" centerZ="0" radiusX="'+value_radius+'" radiusY="'+value_radius+'" radiusZ="'+value_radius+'"></uformia.base.Sphere.20110605>';
    if(codeLanguage == 'coffeescad0.1') {
        var selectedStr = blockIsSelected(this,'bubbletoshape') ? '.color(colors.selected)' : '';
        code = '"'+(defaultText)+'"';// FIXME, should be escaped
        console.log('input field text: ','name:',inputName,defaultText,maxChars,'code:',code);
        return [code, Blockly.JavaScript.ORDER_NONE];
    } else
        return 'sphere(r='+value_radius+');\n';
};
Blockly.Language.input_field_text = {
  category: ucfirst(getLang('inputField')),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(61);
    this.appendDummyInput()
        .appendTitle("Text field");
    this.appendDummyInput()
        .appendTitle("label")
        .appendTitle(new Blockly.FieldTextInput("textInput"), "inputName");
    this.appendDummyInput()
        .appendTitle("default")
        .appendTitle(new Blockly.FieldTextInput("My text"), "defaultText");
    this.appendDummyInput()
        .appendTitle("max chars")
        .appendTitle(new Blockly.FieldTextInput("20"), "maxChars");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};
