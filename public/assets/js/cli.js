// CLI
var matchPhrases = [];
var matchingPhrases = [];


var keyLog = [];
var prevKey;
var selectedIndex = 0;
var charNum = 0;
var argumentIndex = 0; // 0 is cmd, 1 is first argument.

matchPhrases['define name=[myblockname]'] = function(args){
  var name = 'myblockname';
  console.log(args);
  if(args && args.length>1) {
    name = args[1];
  }
  xml = getXML();
  saveCode(name,'define');
  setTimeout(function(){loadMatches('shapes');},1000); // reload modules. Wait a second to make sure its propagated on the server
};


matchPhrases['clear'] = function() { if(confirm('Are you sure you want to clear the canvas?')) clearWorkspace(); };
matchPhrases['save'] = function() { saveCode(); };
matchPhrases['load'] = function() { loadCode(); };
matchPhrases['number [10]'] = function() {
  createBlockAtCursor('<xml><block type="math_number"><title name="NUM">10</title></block></value>');
};

function resetMatches() {
  for (var i in matchPhrases) { // copy match phrases
   matchingPhrases[i] = matchPhrases[i];
  }
}

resetMatches();
document.onload = function() {
  $('#quickSearchDiv input').on('blur', function () {
    setTimeout(function(){$('#qsResults').html(' ');},200);
  });
};

function myKeyEvent(e){
  var keyCode = e.keyCode;
  // var prevKey;
  keyLog.push(e);
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
    case 40://arrow down
      selectedIndex++;
      return updateQuickSearchHtml();
    case 38://arrow down
      selectedIndex--;
      return updateQuickSearchHtml();
    case 32:// spacebar
      return updateQuickSearchHtml();
    case 51:// a # sign, for numbers
      if(e.shiftKey) {
        var num = prompt("Enter a number to create a block?");
        console.log(num,Number(num));
        createBlockAtCursor('<xml><block type="math_number"><title name="NUM">'+Number(num)+'</title></block></value>');
        return;
      }
    break;
    case 191:
    $('#quickSearchDiv input').focus();
    break;
    case 9: // tab
      // supplement the quicksearch input with the top result
      console.log("trying to supplement argument "+argumentIndex+" with selected result at index",selectedIndex);
      var i=0;for(phrase in matchingPhrases) {
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
    console.log("arg"+ argumentIndex+': abort. No focus.');
    return;

  }
  // start pruning process
  for(phrase in matchingPhrases){
    var myChar = String.fromCharCode(keyCode).toLowerCase();
    firstOccur = phrase.indexOf(myChar.toLowerCase());
    console.log(myChar,' occurs in ',phrase,' at char ',firstOccur,' (now at char '+charNum+')');
    
    // console.log('phrase: ',phrase,'cmd:',matchPhrases[phrase],' char:',phrase.substring(0,1),' ',firstOccur));
    if(firstOccur == charNum)
    {
      selectedIndex = 0;

    } else {
        if(argumentIndex > 0) {
        console.log(argumentIndex+' argument. Not pruning.');
      }
        else {
          console.log('pruned: '+phrase);
          if(keyCode != 13)
            delete matchingPhrases[phrase]; // prune matching phrases
      }
    }
  }
  switch(keyCode) {
    case 191: // slash forward (/)
      resetMatches();
      $('#quickSearchDiv input').focus();
      setTimeout(function(){$('#quickSearchDiv input').attr('value','')},1);
      break;
    case 27: // escape
      charNum = 0;
      resetMatches();
      $('#quickSearchDiv input').blur();
      $('#qsResults').html(' ');
    break;
    case 8: // backspace
      // FIXME: should repeat the pruning process...
      resetMatches();
    break;
    case 13: // enter
      runCmd();
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
function runCmd(){
    var i=0;
    console.log("Enter. Cmd: "+$('#quickSearchDiv input').attr('value'));
    setTimeout(function(){$('#qsResults').html(' ');},10);
    $('#quickSearchDiv input').blur();
    for (phrase in matchingPhrases) {
      if(i==selectedIndex)
      {
        console.log('performing match # '+selectedIndex + ': '+phrase);
        var args = ($('#quickSearchDiv input').attr('value') + '').split(' ');
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
  for (i in matchingPhrases) {
    var iBold = '';
    var iNormal = '';
    iBold = i.substring(0,charNum+1);
    iNormal = i.substring(charNum+1);
    resultHtml += '<span myIndex="'+(myIndex++)+'" class="qsItem'+((selectedIndex==itemNr) ? ' qsSelected': '') +'"><b>' +iBold + '</b>' + iNormal + "</span><br>";
    itemNr++;
  }
  $('#qsResults').html(resultHtml); 
  $('#qsResults .qsItem').on('click',function(){
    selectedIndex = $(this).attr('myIndex');
    $('#quickSearchDiv input').attr('value',$(this).val());// FIXME: get value from matchingPhrases, not from HTML element.
    runCmd();
  });
  $('#qsResults .qsItem').on('hover',function(){
    $('.qsSelected').removeClass('qsSelected');
    $(this).addClass('qsSelected');
    selectedIndex = $(this).attr('myIndex');
  });
}
window.onkeydown = myKeyEvent;