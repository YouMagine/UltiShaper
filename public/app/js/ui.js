// default lang:
LANG = LANG_EN_EN;

re = /l=([^&]*)/g;
var urlLang = '';
try
{
  if(location.search)
    urlLang = re.exec(location.search.slice(1))[1];
  else urlLang = 'EN_EN';
  if(urlLang=='NL_NL'){ LANG = LANG_NL_NL;}
  if(urlLang=='EN_EN'){ LANG = LANG_EN_EN;}
  if(urlLang=='DE_DE'){ LANG = LANG_DE_DE;}
} catch (err) {
  console.log('Error trying to detect best language. Defaulting to English.',err);
}
if(typeof urlLang !='string' || urlLang == '') 
  urlLang = 'EN_EN';

$(window).resize(function() {
  $('#blockly').css('top',$(window).height()-115);
  $('#blockly').css('height',360);
  $('#blockly').css('right',$(window).width());
  // $('#blockly').css('width',$(window).width()-20);
  // $('#blockly.modal').css('width','');
  // $('#blockly').css('left',$(window).width()/2-100);
  $('#blockly').css('width',$(window).width()-20);
  // $('#blockly').css('width',$(window).width()-40);
  $('#qsResults').css('left',$('#quickSearchDiv').position().left);
  if (navigator.userAgent.indexOf("Firefox")!=-1) 
    // $('#blockly').css('top',$(window).height()-$('#blockly').height()/2+500);
    $('#blockly').css('top',$(document).height()-$('#blockly').height()/2+60);
});


  $("#langDropdown").change(function(o){
    var newLang = $("#langDropdown").val();
    if(newLang == 'NL_NL') if(window.confirm(LANG_NL_NL.switchLangResets)) document.location = "/app?l="+newLang;
    if(newLang == 'EN_EN') if(window.confirm(LANG_EN_EN.switchLangResets)) document.location = "/app?l="+newLang;
    if(newLang == 'DE_DE') if(window.confirm(LANG_DE_DE.switchLangResets)) document.location = "/app?l="+newLang;  
  });
  if(urlLang != '') $("#langDropdown").val(urlLang);
  

