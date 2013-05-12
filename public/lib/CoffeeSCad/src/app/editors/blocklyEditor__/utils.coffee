define (require)->
  getXML = ->
    xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)
    xml_text = Blockly.Xml.domToText(xml)
    xml_text
  
  return {"getXML": getXML}
