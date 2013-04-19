// CLI
var matchPhrases = [];
var matchingPhrases = [];


var keyLog = [];
var prevKey;
var selectedIndex = 0;
var charNum = 0;
var argumentIndex = 0; // 0 is cmd, 1 is first argument.
var reverseSearch = false;

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
  if((args.length >= 1) && args[1] == 'y') { clearWorkspace(); return; }
  if(confirm('Are you sure you want to clear the canvas?')) {
    clearWorkspace();
  }
};

matchPhrases.save = function() { saveCode(); };
matchPhrases.load = function() { loadCode(); };

matchPhrases.duplicate = function () { Blockly.mainWorkspace.paste(Blockly.Xml.blockToDom_(Blockly.selected)); }
matchPhrases['number [10]'] = function(args) {
var num = 10;
if(args.length > 1)
  num = args[1];

  createBlockAtCursor('<xml><block type="math_number"><title name="NUM">'+num+'</title></block></value>');
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

matchPhrases.previousBlock = function () {
  console.log("prevBlock");
  var sel = Blockly.selected;
  if(sel === null) {
    var topBlocks = Blockly.mainWorkspace.getTopBlocks();
    if(topBlocks.length === 0) return;
    sel = topBlocks[topBlocks.length-1];
    sel.select();
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
  charNum = $('#quickSearchDiv input').val().length;
  argumentIndex = ($('#quickSearchDiv input').val().match(/ +/g)||[]).length;
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
      if(e.shiftKey) {return matchingPhrases['nextBlock'].call(null,null);}
      if(!focus) return;
      selectedIndex++;
      return updateQuickSearchHtml();
    case 38://arrow up
      if(e.shiftKey) {return matchingPhrases['previousBlock'].call(null,null);}
      if(!focus) return;
      selectedIndex--;
      return updateQuickSearchHtml();
    case 32:// spacebar
      return updateQuickSearchHtml();
    case 8: // backspace
      // FIXME: should repeat the pruning process...
      charNum--;
      console.log($('#quickSearchDiv input').val());
      resetMatches();
      console.log('after reset: ',matchingPhrases);
    break;
    case 51:// a # sign, for numbers
      if(e.shiftKey) {
        var num = prompt("Enter a number to create a block?");
        console.log(num,Number(num));
        createBlockAtCursor('<xml><block type="math_number"><title name="NUM">'+Number(num)+'</title></block></value>');
        return;
      }
    break;
    case 191:
    if(e.shiftKey)
        reverseSearch = true;
    else 
      reverseSearch = false;
    $('#quickSearchDiv input').focus();
    break;
    case 9: // tab
      // supplement the quicksearch input with the top result
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
  }
  focus = $('#quickSearchDiv input').is(":focus");
  if(!focus) {
    console.log("arg"+ argumentIndex+': abort. No focus. Turning off reverse search.');

    reverseSearch = false;

    return;

  }
  pruneCli(keyCode);

  switch(keyCode) {
    case 191: // slash forward (/)
      if(e.shiftKey)
        reverseSearch = true;
      resetMatches();
      $('#quickSearchDiv input').focus();
      setTimeout(function(){$('#quickSearchDiv input').attr('value','')},1);
      setTimeout(function(){$('#quickSearchDiv input').attr('value','')},50);
      break;
    case 13: // enter
      runCmd(true);
    break;
    default:
      console.log("key:",keyCode,e,'arg',argumentIndex);
      // var s = "";
      // for (i in matchingPhrases) {
      //    s += i + ", ";
      // }
      // console.log('phrases left: '+s);
    break;
  }
  updateQuickSearchHtml();

    // prevKey = e;
}
function pruneCli(keyCode){
    // start pruning process
  var myChar = String.fromCharCode(keyCode).toLowerCase();
  if(keyCode === 0 || keyCode === 8) { //null or backspace
    if(charNum > 0) {
      charNum--;
      var qsVal = $('#quickSearchDiv input').val();
      myChar = qsVal[charNum];
      console.log('qsVal:',qsVal, "myChar is now ",myChar,'charnum',charNum);
    } else return;
    console.log('mychar:',myChar);
}
  for(var phrase in matchingPhrases){
    var firstOccur = phrase.indexOf(myChar.toLowerCase());
    
    // console.log('phrase: ',phrase,'cmd:',matchPhrases[phrase],' char:',phrase.substring(0,1),' ',firstOccur));
    if(firstOccur == charNum)
    {
      selectedIndex = 0;

    } else {
        if(argumentIndex > 0) {
          console.log(myChar,' occurs in ',phrase,' at char ',firstOccur,' (now at char '+charNum+')',argumentIndex+' argument. Not pruning.');
      }
        else {
          console.log(myChar,' occurs in ',phrase,' at char ',firstOccur,' (now at char '+charNum+')',argumentIndex+' argument. Pruned!!!!');
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
        args = ($('#quickSearchDiv input').attr('value') + '').split(' ');
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
    runCmd();
  });
  $('#qsResults .qsItem').on('hover',function(){
    $('.qsSelected').removeClass('qsSelected');
    $(this).addClass('qsSelected');
    selectedIndex = $(this).attr('myIndex');
  });
  $('#qsResults').show();

}
window.onkeydown = myKeyEvent;