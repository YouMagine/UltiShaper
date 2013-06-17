// CLI
var matchPhrases = [];
var matchingPhrases = [];

var keyLog = [];
var prevKey;
var selectedIndex = 0;
var charNum = 0;
var argumentIndex = 0; // 0 is cmd, 1 is first argument.
var insertBlockBefore = false;

matchPhrases['define [name=myblockname]'] = function(args){
  var name = 'myblockname';
  console.log(args);
  if(args && args.length>1) {
    name = args[1];
  }
  xml = getXML();
  saveCode(name,'define');
  setTimeout(function(){loadMatches('shapes');},1000); // reload modules. Wait a second to make sure its propagated on the server
};

matchPhrases['save [name=mydesign]'] = function(args){
  var name = 'mydesign';
  console.log(args);
  if(args && args.length>1) {
    name = args[1];
  }
  xml = getXML();
  saveCode(name,'save');
  setTimeout(function(){loadMatches('shapes');},1000); // reload modules. Wait a second to make sure its propagated on the server
};


matchPhrases.clear = function(args){
  console.log(args);
  if(typeof args !== 'undefined' && (args.length >= 1) && args[1] == 'y') { clearWorkspace(); return; }
  $('#jqDialog').attr('title','Are you sure?');

  console.log($('#jqDialog').dialog({
    modal: true,
    resizable: false,
    autoOpen:false,
    buttons: {
        "Clear canvas": function() {
          $( this ).dialog( "close" );
          clearWorkspace();
        },
        // TODO: add save button.
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
  }));
  setTimeout(function(){$('#jqDialog').dialog('open');$($('#jqDialog').offsetParent()).css('z-index','3000');},150);
  // if(confirm('Are you sure you want to clear the canvas?')) {
    // clearWorkspace();
  // }
};

matchPhrases.save = function() { saveCode(); };
matchPhrases.load = function() { loadCode(); };

matchPhrases.duplicate = function () { Blockly.mainWorkspace.paste(Blockly.Xml.blockToDom_(Blockly.selected)); }
matchPhrases['number [10]'] = function(args) {
  var num = 10;
  console.log(args);
  args.shift(); // remove first el.
  for(var i in args) {
    if(!isNaN(args[i]))
      createBlockAtCursor('<block type="math_number"><title name="NUM">'+Number(args[i])+'</title></block>');
  }
};
// block navigation

matchPhrases.nextBlock = function () {
  console.log("nextBlock");
  var sel = Blockly.selected;
  if(sel === null) {
    //gettopbl and select that
    var topBlocks = Blockly.mainWorkspace.getTopBlocks();
    if(topBlocks.length === 0) return;
    sel = topBlocks[0];
    sel.select();
    return;
  }
  sel.unselect();
  if(sel.nextConnection !== null && sel.nextConnection.targetConnection !== null) {
    sel.nextConnection.targetConnection.sourceBlock_.select();
  }
};

var parentSel = null;
var selectedChildIndex = 0;


matchPhrases.rightBlock = function () {
  console.log("rightBlock");
  var sel;
  if(parentSel === null)
    sel = Blockly.selected;
  else sel = parentSel;
  if(sel === null) {
    //gettopbl and select that
    var topBlocks = Blockly.mainWorkspace.getTopBlocks();
    if(topBlocks.length === 0) return;
    sel = topBlocks[0];
    sel.select();
    return;
  }
  sel.unselect();
  if(sel.outputConnection === null) // has no outputs, probably is not an input.
    parentSel = sel;
  console.log("selected child",selectedChildIndex);
  selectedChildIndex++;
  try {
    // Blockly.selected.unselect();
  if(typeof sel.inputList[selectedChildIndex] === "object") {
    console.log('selected:',sel.inputList[selectedChildIndex-1]);

    if(sel.inputList[selectedChildIndex].connection !== null && sel.inputList[selectedChildIndex-1].connection.targetConnection !== null) {
      if(sel.inputList[selectedChildIndex-1])
      sel.inputList[selectedChildIndex-1].connection.targetConnection.sourceBlock_.unselect();
      sel.inputList[selectedChildIndex].connection.targetConnection.sourceBlock_.select();
    }
  } else { selectedChildIndex = 0;
  }
  } catch (e) {

  }
  // if(sel.nextConnection !== null && sel.nextConnection.targetConnection !== null) {
    // sel.nextConnection.targetConnection.sourceBlock_.select();
  // }
};
matchPhrases.leftBlock = function () {
  console.log("leftBlock");
  selectedChildIndex = 0;
};

matchPhrases.previousBlock = function () {
  console.log("prevBlock");
  var sel = Blockly.selected;
  if(sel === null) {
    var topBlocks = Blockly.mainWorkspace.getTopBlocks();
    if(topBlocks.length === 0) return;
    var nextBlock = topBlocks[topBlocks.length-1];
    var tmpNextBlock;
    while(typeof nextBlock === "object") {
        try {
          tmpNextBlock = nextBlock.nextConnection.targetConnection.sourceBlock_;
        }catch (e) {
           // statements to handle any exceptions
           console.log(e); // pass exception object to error handler
           break;
        }
        nextBlock = tmpNextBlock;
    }
    nextBlock.select();
    return;
  }
  sel.unselect();
  if(sel.previousConnection !== null && sel.previousConnection.targetConnection !== null) {
    sel.previousConnection.targetConnection.sourceBlock_.select();
  }
};



function resetMatches() {
  for (var i in matchPhrases) { // copy match phrases
   matchingPhrases[i] = matchPhrases[i];
  }
}

resetMatches();

function initCli() {
  $('#qsResults').hide();
  $('#quickSearchDiv input').blur( function () {

    setTimeout(function(){$('#qsResults').html(' ');$('#qsResults').hide();},300);
  });
}

function myKeyEvent(e){
  var keyCode = e.keyCode;
  // var prevKey;
  keyLog.push(e);
  var focus = $('#quickSearchDiv input').is(":focus");
  if(!e.keyCode) keyCode = e.which;
  
  quickSearchVal = $('#quickSearchDiv input').val();
  var charNum = -1;
  
  if (quickSearchVal!==null)
  {
      charNum = quickSearchVal.length;
      argumentIndex = (quickSearchVal.match(/ +/g)||[]).length;
  }
  console.log("key:",keyCode,e,'arg',argumentIndex);
  focus = $('#quickSearchDiv input').is(":focus");

  switch(keyCode) {
    case 90:// Ctrl-Z / cmd-Z
      if(e.metaKey || e.ctrlKey) {
        if(e.shiftKey) // redo
        {
          console.log("Redo()");
          if(typeof hist === 'object') hist.redo();
        }
        else {
          console.log("Undo()");
          if(typeof hist === 'object') hist.undo();
        }
        return updateQuickSearchHtml();
      }
    break;
    case 27: // escape
      charNum = 0;
      resetMatches();
      $('#quickSearchDiv input').blur();
      // $('#qsResults').html(' ');
      $('#qsResults').hide();
    break;
    case 40://arrow down
      if(e.shiftKey) {return matchPhrases['nextBlock'].call(null,null);}
      if(!focus) return;
      selectedIndex++;
      return updateQuickSearchHtml();
    case 38://arrow up
      if(e.shiftKey) {return matchPhrases['previousBlock'].call(null,null);}
      if(!focus) return;
      selectedIndex--;
      return updateQuickSearchHtml();
    case 37://arrow left
      if(e.shiftKey) {return matchPhrases['leftBlock'].call(null,null);}
      break;
    case 39://arrow right
      if(e.shiftKey) {return matchPhrases['rightBlock'].call(null,null);}
      break;
    case 32:// spacebar
      return updateQuickSearchHtml();
    case 8: // backspace
      // FIXME: should repeat the pruning process...
      // charNum--;
      if(!focus) return;
      if(e.shiftKey) return; // dont run it on 'delete' on mac (shift-backspace)
      charNum--;
      console.log($('#quickSearchDiv input').val());
      console.log('after reset: ',matchingPhrases,'changing keyCode from ',keyCode);
      charAtN = $('#quickSearchDiv input').val().length - 2;
      console.log('to: ',keyCode,'code at charN',charAtN,'in str:',$('#quickSearchDiv input').val());
      v = $('#quickSearchDiv input').val();
      newVal = v.substring(0,charNum);
      console.log('setting val to ',newVal);
      $('#quickSearchDiv input').val(newVal);
      resetMatches();
      console.log('pruneCli(keyCode==',keyCode,',charAtN==',charAtN,');');
      var i = 0;
      while(i <= (charAtN)) {
        keyCode = $('#quickSearchDiv input').val().toUpperCase().charCodeAt(i);
        pruneCli(keyCode,i);
        i++;
      }
      updateQuickSearchHtml();
      return false;
    break;
    case 51:// a # sign, for numbers
      if(e.shiftKey) {
        var num = prompt("Enter a number to create a block?");
        console.log(num,Number(num));
        createBlockAtCursor('<block type="math_number"><title name="NUM">'+Number(num)+'</title></block>');
        return;
      }
    break;
    case 191:
      insertBlockBefore = false;
      if(e.shiftKey)
          insertBlockBefore = true;
      resetMatches();
      $('#quickSearchDiv input').focus();
      setTimeout(function(){$('#quickSearchDiv input').attr('value','')},1);
      setTimeout(function(){$('#quickSearchDiv input').attr('value','')},50);
    break;
    case 9: // tab
      // supplement the quicksearch input with the top result
      if(!focus) return;
      console.log("trying to supplement argument "+argumentIndex+" with selected result at index",selectedIndex);
      var i=0;for(var phrase in matchingPhrases) {
        if(i==selectedIndex)
        {
          var firstWord = '';
          firstWord = $('#quickSearchDiv input').attr('value');
          for(ii=firstWord.length ; ii<phrase.length ; ii++) {
            if(phrase.charAt(ii) == ' ') break;
            firstWord += phrase.charAt(ii);
          }
          $('#quickSearchDiv input').attr('value',firstWord+' ');
          break;
        }
        i++;
      }
      // regain focus on input field
      setTimeout(function(){$('#quickSearchDiv input').focus()},10);
      argumentIndex++; // entering next argument.

      return;
    case 13: // enter
      if(!focus) return;
      runCmd(true);
    break;

  }
  if(!focus) {
    // console.log("arg"+ argumentIndex+': abort.');
    // TODO add minus sign
    if(keyCode === 189) {
      try { 
        if(typeof Blockly.FieldTextInput.htmlInput_ === "undefined")
          Blockly.selected.inputList[0].titleRow[0].showEditor_();
        else if(Blockly.FieldTextInput.htmlInput_ === null)
          Blockly.selected.inputList[0].titleRow[0].showEditor_();
      }
      catch (e) {
      }
    }
    // FIXME: This is realy messy code. Clean it up. The goal of this code is to fix a Blockly bug without changing blockly
    // This turns out to be harder than I though. I should fix it in blockly or report the bug.
    if(keyCode > 47 && keyCode <= 57 && Blockly.selected && !e.shiftKey) {
      if(Blockly.selected.type == 'math_number') {
        var textFieldSelected = true;
        if(typeof Blockly.FieldTextInput.htmlInput_ === "undefined")
          textFieldSelected = false;
        if(Blockly.FieldTextInput.htmlInput_ === null) 
          textFieldSelected = false;
        console.log('textFieldSelected',textFieldSelected);
        if(textFieldSelected) {
        }
        if(true) {// if(textFieldSelected == true) {
          console.log(Blockly.selected,keyCode-48);// 0=48, 9=57
          if(typeof Blockly.FieldTextInput.htmlInput_ === 'object' && Blockly.FieldTextInput.htmlInput_ !== null) {
            console.log('FTI obj...',Blockly.FieldTextInput.htmlInput_);
            // $(Blockly.FieldTextInput.htmlInput_).focus();
            // Blockly.FieldTextInput.htmlInput_.focus();
            // Blockly.FieldTextInput.htmlInput_.blur();

            // return;
          }
          try {

            console.log('typeof htmlInput_: ',typeof Blockly.FieldTextInput.htmlInput_);
            console.log('selblock text_: ',Blockly.selected.inputList[0].titleRow[0].text_);
            // Blockly.selected.inputList[0].titleRow[0].setText(keyCode -48 + "");
            // TODO: if it's NOT the same textfield object, blur first
            // 
            // Blockly.selected.inputList[0].titleRow[0].validate_();
            // console.log("htmlInput_",Blockly.selected.inputList[0].titleRow[0].htmlInput_);
            if(typeof Blockly.FieldTextInput.htmlInput_ === "undefined") {
              // Blockly.selected.inputList[0].titleRow[0].showEditor_();
            }
            else if(Blockly.FieldTextInput.htmlInput_ === null) {
                Blockly.selected.inputList[0].titleRow[0].showEditor_();
            }
            // htmlInput_
            // Blockly.bindEvent_(htmlInput, 'blur', this, this.onHtmlInputBlur_);


          } catch (e) {
          }

        }

        } 

    }

    insertBlockBefore = false;

    return;

  }
  charAtN = $('#quickSearchDiv input').val().length - 1;
  console.log('charAt:',charAtN,'input:',$('#quickSearchDiv input').val());
  if(keyCode > 64 && keyCode <= 91) {
    console.log("pruning, because key is",keyCode);
    pruneCli(keyCode);
  }
  else
    pruneCli(keyCode,charAtN);

  updateQuickSearchHtml();

    // prevKey = e;
}
function pruneCli(keyCode,charAtN){
    // start pruning process
  var myChar;
  myChar = String.fromCharCode(keyCode).toLowerCase();
  charNum = $('#quickSearchDiv input').val().length + 1;
  console.log('pruneCli(..,',typeof charAtN,')');
  if(typeof charAtN === 'number') {
    console.log("charAtN was specified and = ",charAtN);
    // charNum--;
    charNum = charAtN + 1;

    // if(charAtN<0)
      // myChar = $('#quickSearchDiv input').attr('value').charAt(charAtN);
  }
  if(charNum == 0) { resetMatches(); return }
  var qsVal = $('#quickSearchDiv input').val();
  // myChar = qsVal.charAt(charNum);
      console.log('qsVal:',qsVal, "myChar is now ",myChar,'charnum',charNum);
  for(var phrase in matchingPhrases){
    var firstOccur = phrase.indexOf(myChar.toLowerCase());
    
    // console.log('phrase: ',phrase,'cmd:',matchPhrases[phrase],' char:',phrase.substring(0,1),' ',firstOccur));
    if(firstOccur == (charNum-1))
    {
      selectedIndex = 0;

    } else {
        if(argumentIndex > 0) {
          console.log(myChar,' occurs in ',phrase,' at char ',firstOccur,' (now at char '+(charNum-1)+')',argumentIndex+' argument. Not pruning.');
      }
        else {
          console.log(myChar,' occurs in ',phrase,' at char ',firstOccur,' (now at char '+(charNum-1)+')',argumentIndex+' argument. Pruned!!!!');
          if(keyCode != 13)
            delete matchingPhrases[phrase]; // prune matching phrases
      }
    }
  }
}

function runCmd(enterEvent){
    var i=0;
    console.log("runCmd() "+$('#quickSearchDiv input').attr('value'));
    setTimeout(function(){$('#qsResults').hide();},10);
    $('#quickSearchDiv input').blur();
    var args;
    for (var phrase in matchingPhrases) {
      if(i==selectedIndex)
      {
        if(enterEvent)
        args = ($('#quickSearchDiv input').attr('value') + '').trim().split(' ');
        console.log('performing match # '+selectedIndex + ': '+phrase,'args:',args);
        if(typeof matchingPhrases[phrase] == 'function')
          matchingPhrases[phrase].call(null,args);
        if(typeof matchingPhrases[phrase] == 'string')
          createBlockAtCursor(matchingPhrases[phrase]);
        if(typeof matchingPhrases[phrase] == 'object')
        {
          console.log(matchingPhrases[phrase]);
          createBlockAtCursor(matchingPhrases[phrase].xmldata);
        }

      break;
      }
      i++;
    }
    $('#quickSearchDiv input').attr('value','');
    resetMatches();
    // $('#qsResults').html(' ');
}
function updateQuickSearchHtml() {
  var resultHtml = '';
  var itemNr = 0;
  // console.log($('#quickSearchDiv input').attr('value').length);
  // if($('#quickSearchDiv input').attr('value').length == 0) { $('#qsResults').html(' '); return; }
  var myIndex=0;
  for (var i in matchingPhrases) {
    var iBold = '';
    var iNormal = '';
    iBold = i.substring(0,charNum+1);
    iNormal = i.substring(charNum+1);
    resultHtml += '<div myIndex="'+(myIndex++)+'" class="qsItem'+((selectedIndex==itemNr) ? ' qsSelected': '') +'"><b>' +iBold + '</b>' + iNormal + "</div>";
    itemNr++;
  }
  $('#qsResults').html(resultHtml);
  $('#qsResults .qsItem').on('click',function(){
    selectedIndex = $(this).attr('myIndex');
    console.log('clicked item',selectedIndex);
    $('#quickSearchDiv input').attr('value',$(this).val());// FIXME: get value from matchingPhrases, not from HTML element.
    runCmd(true);
  });
  $('#qsResults .qsItem').on('hover',function(){
    $('.qsSelected').removeClass('qsSelected');
    $(this).addClass('qsSelected');
    selectedIndex = Number($(this).attr('myIndex'));
  });
  $('#qsResults').show();

}
window.onkeydown = myKeyEvent;