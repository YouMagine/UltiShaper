// Generated by CoffeeScript 1.6.2
define(function(require) {
  var getXML;

  getXML = function() {
    var xml, xml_text;

    xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    xml_text = Blockly.Xml.domToText(xml);
    return xml_text;
  };
  return {
    "getXML": getXML
  };
});
