function MySliderInput(sliderType,sliderName,val,minVal,maxVal,stepIncrement) {
    this.uuid = uuid();
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
        this.lastVal = this.val; // remember last value
        this.val = Math.max(Math.min(val,this.maxVal),this.minVal);
        return this;
    };
    this.setUUID = function (val) {
        this.uuid = val;
    };
    this.toString = function () {
        return 'Slider with name '+this.sliderName+' and value '+this.val;
    };
}

function InputManager() {
    this.mySliderInputs = [];

    this.addSlider = function (sliderInput) {
        this.mySliderInputs.push(sliderInput);
        return sliderInput.uuid;
        // return a 'uuid'
    };
    this.getInputByUUID = function (uuidQuery) {
        for(var i=0;this.mySliderInputs.length > i;i++){
            if(this.mySliderInputs[i].uuid == uuidQuery) {
                // console.log('Found: ',this.mySliderInputs[i]);
                return this.mySliderInputs[i];
            }
        }
        // console.log('Input with UUID '+uuidQuery+' was not found.');
        return null;
    };
    this.getInput = function (nr) {
        if(this.mySliderInputs.length >= nr)
            return this.mySliderInputs[nr]; // temporary method, searches just in sliders....
        return false;
    };
    this.list = function () {
        console.log(this.mySliderInputs);
    };
}

var inputManager = new InputManager();


Blockly.JavaScript.input_field_slider = function() {
    var uuid = this.getTitleValue('uuid');
    var sliderType = this.getTitleValue('sliderType') || "Unspecified";
    var sliderName = this.getTitleValue('sliderName') || "Value:";
    var minVal = this.getTitleValue('minVal') || -42;
    var maxVal = this.getTitleValue('maxVal') || 42;
    var stepIncrement = this.getTitleValue('stepIncrement') || 1;
    var code = '';
    var val = 42;
    setTimeout(function(){$('#inputPane').show();},200);

    planeSvg.initSlider(0);
    planeSvg.setText('row1Text',sliderName);
    // planeSvg.setText('row2Text',sliderName);
    // create a new slider:
    var slider = new MySliderInput(sliderType,sliderName,val,minVal,maxVal,stepIncrement);
    slider.setUUID(uuid);
    if(inputManager.getInputByUUID(uuid) === null) {
        // console.log('uuid not found... adding the slider to inputs.');
        inputManager.addSlider(slider);
    } else {
        // uuid was found. Slider was created before. Use that one.
        slider = inputManager.getInputByUUID(uuid);
    }
    val = slider.val;

    code = ""+val;
    return [code, Blockly.JavaScript.ORDER_NONE];
};
var rootEl;

Blockly.Language.input_field_slider = {
  category: ucfirst(getLang('inputField')),
  helpUrl: 'http://www.example.com/',
  init: function() {
    this.setColour(61);
    var uuidField = new Blockly.HiddenField(uuid());
    // uuidField.setVisible(false);
    // rootEl = uuidField.getRootElement();
    this.appendDummyInput()
    .appendTitle(uuidField, "uuid");
    // todo: setDisabled on block to make it immutable.
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
