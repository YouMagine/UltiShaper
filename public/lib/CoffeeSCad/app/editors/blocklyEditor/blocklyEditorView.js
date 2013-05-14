// Generated by CoffeeScript 1.6.2
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function(require) {
  var $, BlocklyEditorView, appVent, jquery_layout, jquery_ui, marionette, template, utils, _;

  $ = require('jquery');
  _ = require('underscore');
  require('bootstrap');
  marionette = require('marionette');
  jquery_layout = require('jquery_layout');
  jquery_ui = require('jquery_ui');
  appVent = require('core/messaging/appVent');
  template = require("text!./blocklyEditorView.tmpl");
  utils = require('./utils');
  BlocklyEditorView = (function(_super) {
    __extends(BlocklyEditorView, _super);

    BlocklyEditorView.prototype.template = template;

    BlocklyEditorView.prototype.className = "blocklyEditor";

    BlocklyEditorView.prototype.ui = {
      toolbox: "#blocklyToolbox"
    };

    BlocklyEditorView.prototype.events = {
      "resize:start": "onResizeStart",
      "resize:stop": "onResizeStop",
      "resize": "onResizeStop"
    };

    function BlocklyEditorView(options) {
      this.onClose = __bind(this.onClose, this);
      this.onResizeStop = __bind(this.onResizeStop, this);
      this.onResizeStart = __bind(this.onResizeStart, this);
      this.onDomRefresh = __bind(this.onDomRefresh, this);
      this._blockIsShape = __bind(this._blockIsShape, this);
      this._blockIsSelected = __bind(this._blockIsSelected, this);
      this.clearWorkspace = __bind(this.clearWorkspace, this);
      this.codeUpdateFunction = __bind(this.codeUpdateFunction, this);
      this._tearDownEventHandlers = __bind(this._tearDownEventHandlers, this);
      this._setupEventHandlers = __bind(this._setupEventHandlers, this);      BlocklyEditorView.__super__.constructor.call(this, options);
      this.settings = options.settings;
      this._setupEventHandlers();
      this.project = this.model;
      this.cursor_rot = [0, 0, 0];
      this.cursor_trans = [0, 0, 0];
      this.cursor_scale = [1, 1, 1];
      this.colors = {
        selected: [0.6, 0.5, 0.2],
        unselected: [124 / 256, 153 / 256, 96 / 255],
        limegreen: [122 / 256, 182 / 256, 69 / 255]
      };
      this.app2 = null;
      this.codeLanguage = 'vol0.1';
    }

    BlocklyEditorView.prototype._setupEventHandlers = function() {};

    BlocklyEditorView.prototype._tearDownEventHandlers = function() {};

    BlocklyEditorView.prototype.codeUpdateFunction = function() {
      var allFields, code, codeLanguage, i, inputs, joinShapesList, langDropbox, myVars, post, pre, projectMainCoffeeFile, projectMainFile, str, variables, xml;

      this.skipMyUpdate = false;
      this.numUpdates = 0;
      this.cursor_rot = [0, 0, 0];
      this.cursor_trans = [0, 0, 0];
      this.cursor_scale = [1, 1, 1];
      window.cursor_rot = this.cursor_rot;
      window.cursor_move = this.cursor_trans;
      window.cursor_scale = this.cursor_scale;
      window.colors = this.colors;
      if (this.skipMyUpdate) {
        console.log("Skipping my update...", skipMyUpdate);
        return;
      }
      xml = utils.getXML();
      if (typeof inputManager === "object") {
        inputs = inputManager.list();
        i = 0;
        while (inputs.length > i) {
          if (xml.indexOf(this.inputs[i].uuid) === -1) {
            console.log(inputManager.list());
            console.log("Was : ", this.inputs[i], "removed?");
            $("#input" + this.inputs[i].uuid, planeSvg.document).remove();
            inputs.splice(i, 1);
            console.log(inputManager.list());
          }
          i++;
        }
      }
      allFields = inputManager.list();
      $("#inputPane").show();
      if (allFields.length > 0) {
        $("#inputModal").show();
      } else {
        $("#inputModal").hide();
      }
      if (typeof hist !== "undefined") {
        hist.addEntry(xml);
      }
      langDropbox = document.getElementById("lang");
      myVars = void 0;
      codeLanguage = $("#langDropbox").val();
      if (typeof codeLanguage !== "string") {
        codeLanguage = "coffeescad0.1";
      }
      code = void 0;
      if (codeLanguage === "coffeescad0.1") {
        variables = Blockly.Variables.allVariables();
        code = Blockly.Generator.workspaceToCode("JavaScript");
        joinShapesList = code.split(";");
        pre = "";
        post = "";
        while (joinShapesList.length > 2) {
          str = joinShapesList.shift();
          if (str.substring(0, 4) === "var ") {
            continue;
          }
          pre += str.trim() + ".union(";
          post += ")";
        }
        code = pre + joinShapesList.shift().trim() + post;
        code = "# coffeescad0.33\n\nrot=[0,0,0]\ntr=[0,0,0]\nassembly.add(" + code + ")";
      }
      if (codeLanguage === "vol0.1") {
        code = "<" + "?xml version=\"1.0\" ?" + ">\n <VOL VersionMajor=\"1\" VersionMinor=\"2\">\n     <Parameters />\n     <uformia.base.Model.20110605 Name=\"43\">";
        code += Blockly.Generator.workspaceToCode("JavaScript");
        code += "\n     </uformia.base.Model.20110605>\n </VOL>";
      }
      if (codeLanguage === "scad") {
        code = Blockly.Generator.workspaceToCode("JavaScript");
        code = "$fs=0.4;\n$fa=5;\n" + code;
      }
      projectMainFile = this.project.rootFolder.get("" + this.project.name + ".ultishape");
      projectMainFile.content = xml;
      projectMainCoffeeFile = this.project.rootFolder.get("generated.coffee");
      projectMainCoffeeFile.content = code;
      console.log(code);
      if (this.app2 && this.app2.loadCode) {
        return this.app2.loadCode(code);
      }
    };

    BlocklyEditorView.prototype.clearWorkspace = function() {
      var n, _results;

      n = 0;
      _results = [];
      while (typeof Blockly.mainWorkspace.getTopBlocks(false) !== "undefined") {
        n++;
        if (n > 10) {
          break;
        }
        if (typeof Blockly.mainWorkspace.getTopBlocks(false)[0] !== "undefined") {
          _results.push(Blockly.mainWorkspace.getTopBlocks(false)[0].dispose());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    BlocklyEditorView.prototype._blockIsSelected = function(block, typeOfCheck) {
      var isSelected, o;

      isSelected = false;
      if (!Blockly.selected) {
        return false;
      }
      if (Blockly.selected.id === block.id) {
        return true;
      }
      if (this._blockIsShape(Blockly.selected) && (block.id !== Blockly.selected.id)) {
        return false;
      }
      if (typeOfCheck === "bubbletoshape") {
        o = Blockly.selected;
        while (o.parentBlock_) {
          if (this._blockIsShape(o.parentBlock_) ? block.id === o.parentBlock_.id : void 0) {
            return true;
          }
          if (this._blockIsShape(o.parentBlock_)) {
            return false;
          }
          o = o.parentBlock_;
        }
      }
      return isSelected;
    };

    BlocklyEditorView.prototype._blockIsShape = function(o) {
      if (!o) {
        return false;
      }
      if (o.category && (o.category === ucfirst(LANG.shape))) {
        return true;
      }
      if (o.type && (o.type === "polygons_extrude")) {
        return true;
      }
      if (o.type && (o.type === "assembly_part")) {
        return true;
      }
      return false;
    };

    BlocklyEditorView.prototype._createBlockAtCursor = function(xmlStr) {
      var dom, domChild, lastBlockAdded, secondUpperConnection, selectedBlock, topBlocks, xml;

      if (xmlStr.substring(0, 5) !== "<xml>") {
        xmlStr = "<xml>" + xmlStr + "</xml>";
      }
      if (Blockly.mainWorkspace.getTopBlocks().length === 0) {
        try {
          xml = Blockly.Xml.textToDom(xmlStr);
          Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
          Blockly.mainWorkspace.getTopBlocks()[0].select();
        } catch (_error) {}
        return;
      }
      console.log("createBlockAtCursor(" + xmlStr + ")");
      dom = Blockly.Xml.textToDom(xmlStr);
      domChild = dom.childNodes[0];
      selectedBlock = Blockly.selected;
      console.log("pre paste");
      Blockly.mainWorkspace.paste(domChild);
      console.log("after paste");
      if (selectedBlock !== null) {
        topBlocks = Blockly.mainWorkspace.getTopBlocks();
        if (insertBlockBefore === false) {
          if (topBlocks.length > 1) {
            lastBlockAdded = topBlocks[topBlocks.length - 1];
            if (lastBlockAdded.outputConnection !== null) {
              console.log("Just leaving this block unconnected, since it's an output.", lastBlockAdded);
              return;
            }
            if (selectedBlock.nextConnection === null) {
              return;
            }
            if (selectedBlock.nextConnection.targetConnection === null) {
              return selectedBlock.nextConnection.connect(lastBlockAdded.previousConnection);
            } else {
              console.log("w000t.... complicated stuff.");
              return;
              secondUpperConnection = selectedBlock.nextConnection.targetConnection;
              secondUpperConnection.disconnect();
              selectedBlock.nextConnection.connect(lastBlockAdded.previousConnection);
              return Blockly.fireUiEvent(window, "resize");
            }
          }
        } else {
          console.log("insertBlockBefore", insertBlockBefore);
          if (topBlocks.length > 1) {
            lastBlockAdded = topBlocks[topBlocks.length - 1];
            if (lastBlockAdded.outputConnection !== null) {
              console.log("Just leaving this block unconnected, since it's an output.", lastBlockAdded);
              return;
            }
            if (selectedBlock.previousConnection === null) {
              return;
            }
            if (selectedBlock.previousConnection.targetConnection === null) {
              return selectedBlock.previousConnection.connect(lastBlockAdded.nextConnection);
            } else {
              console.log("w000t.... complicated stuff.");
            }
          }
        }
      }
    };

    BlocklyEditorView.prototype.onDomRefresh = function() {
      var toolbox;

      $('#qsResults').css({
        left: $('#quickSearchDiv').position().left,
        'min-width': $('#quickSearchDiv').width()
      });
      if (typeof initCli === 'function') {
        initCli();
      } else {
        console.log("couldn't load CLI.");
      }
      toolbox = this.ui.toolbox[0];
      Blockly.inject(document.getElementById('svgDiv'), {
        path: 'lib/blockly/',
        toolbox: toolbox
      });
      Blockly.addChangeListener(this.codeUpdateFunction);
      window.blockIsSelected = this._blockIsSelected;
      window.blockIsShape = this._blockIsShape;
      window.createBlockAtCursor = this._createBlockAtCursor;
      window.cursor_rot = this.cursor_rot;
      window.cursor_move = this.cursor_trans;
      return window.cursor_scale = this.cursor_scale;
    };

    BlocklyEditorView.prototype.onResizeStart = function() {};

    BlocklyEditorView.prototype.onResizeStop = function() {
      console.log("blockly view resize stop");
      $('#blockly').css('width', $(window).width() - 20);
      $('#svgDiv').height($(document).height() - 640);
      Blockly.fireUiEvent(window, 'resize');
      return console.log(this);
    };

    BlocklyEditorView.prototype.onClose = function() {
      this._tearDownEventHandlers();
      return this.project = null;
    };

    return BlocklyEditorView;

  })(Backbone.Marionette.ItemView);
  return BlocklyEditorView;
});
