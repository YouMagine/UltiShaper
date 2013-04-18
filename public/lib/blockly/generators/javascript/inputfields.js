function MySliderInput(sliderType,sliderLabel,val,minVal,maxVal,stepIncrement) {
    this.uuid = uuid();
    this.sliderType = sliderType;
    this.sliderLabel = sliderLabel;
    this.val = val;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.stepIncrement = stepIncrement;
    this.update = function (options) {
        // this.sliderType = options.sliderType;
        this.sliderLabel = options.sliderLabel;
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
        return 'Slider with name '+this.sliderLabel+' and value '+this.val;
    };
}

function InputManager() {
    this.myInputs = [];

    this.addSlider = function (sliderInput) {
        this.myInputs.push(sliderInput);
        this.numFields++;
        return sliderInput.uuid;
        // return a 'uuid'
    };
    this.getInputByUUID = function (uuidQuery) {
        for(var i=0;this.myInputs.length > i;i++){
            if(this.myInputs[i].uuid == uuidQuery) {
                // console.log('Found: ',this.myInputs[i]);
                return this.myInputs[i];
            }
        }
        // console.log('Input with UUID '+uuidQuery+' was not found.');
        return null;
    };
    this.getNumFields = function () {
        return this.myInputs.length;
    };
    this.list = function () {
        return(this.myInputs);
    };
    this.clear = function() { this.myInputs = []; };
}

var inputManager = new InputManager();


Blockly.JavaScript.input_field_slider = function() {
    var uuid = this.getTitleValue('uuid');
    var sliderType = this.getTitleValue('sliderType') || "Unspecified";
    var sliderLabel = this.getTitleValue('sliderLabel') || "Value:";
    var minVal = this.getTitleValue('minVal') || -42;
    var maxVal = this.getTitleValue('maxVal') || 42;
    var stepIncrement = this.getTitleValue('stepIncrement') || 1;
    var code = '';
    var val = 20;//
    setTimeout(function(){$('#inputPane').show();},200);

    // create a new slider:
    var slider = new MySliderInput(sliderType,sliderLabel,val,minVal,maxVal,stepIncrement);
    slider.setUUID(uuid);
    if(inputManager.getInputByUUID(uuid) === null) {
        // console.log('uuid not found... adding the slider to inputs.');
        inputManager.addSlider(slider);
    } else {
        // uuid was found. Slider was created before. Use that one.
        slider = inputManager.getInputByUUID(uuid);
        slider.update({sliderType:sliderType,sliderLabel:sliderLabel,minVal:minVal,maxVal:maxVal,stepIncrement:stepIncrement});
    }
    val = slider.val;

    // Determine row number for this field
    allFields = inputManager.list();
    console.log("Going to create the sliders...",'allFields',allFields,'uuid',uuid);
    var fieldNr;
    for(fieldNr = 0; fieldNr < allFields.length ; fieldNr++)
    {
        if(allFields[fieldNr].uuid == uuid) {
            console.log('breaking on' +uuid,'field',fieldNr);
          break;
        }
    }
    var sliderObj = planeSvg.initSlider(fieldNr,uuid,sliderLabel);
    if(sliderObj) {
        slider.sliderObj = sliderObj;
        console.log('initSlider returned ',sliderObj);
    }
    slider.sliderObj.setLabel(sliderLabel);
    slider.sliderObj.setValueText(val);

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
    inputSequencenr = ' '+ (1 + inputManager.getNumFields());

    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown([["Horizontal slider", "horSlider"], ["Vertical slider", "vertSlider"], ["Depth slider", "depthSlider"], ["Hidden slider", "hiddenSlider"]]), "sliderType");
    this.appendDummyInput()
        .appendTitle("label")
        .appendTitle(new Blockly.FieldTextInput("Input"+inputSequencenr+":"), "sliderLabel");
    this.appendDummyInput()
        .appendTitle("min")
        .appendTitle(new Blockly.FieldTextInput("0"), "minVal");
    this.appendDummyInput()
        .appendTitle("max")
        .appendTitle(new Blockly.FieldTextInput("20"), "maxVal");
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
