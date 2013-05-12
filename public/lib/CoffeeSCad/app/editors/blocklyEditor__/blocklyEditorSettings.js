// Generated by CoffeeScript 1.6.2
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function(require) {
  var Backbone, BlocklyEditorSettings;

  Backbone = require('backbone');
  BlocklyEditorSettings = (function(_super) {
    __extends(BlocklyEditorSettings, _super);

    BlocklyEditorSettings.prototype.idAttribute = 'name';

    BlocklyEditorSettings.prototype.defaults = {
      name: "blocklyEditor",
      title: "blockly Editor"
    };

    function BlocklyEditorSettings(options) {
      BlocklyEditorSettings.__super__.constructor.call(this, options);
    }

    return BlocklyEditorSettings;

  })(Backbone.Model);
  return BlocklyEditorSettings;
});
