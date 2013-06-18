// Generated by CoffeeScript 1.6.2
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function(require) {
  var $, Backbone, DialogView, ExternalEditor, ExternalEditorRouter, ExternalEditorSettings, ExternalEditorSettingsView, ExternalEditorView, Project, marionette, reqRes, vent, _;

  $ = require('jquery');
  _ = require('underscore');
  Backbone = require('backbone');
  marionette = require('marionette');
  vent = require('core/messaging/appVent');
  reqRes = require('core/messaging/appReqRes');
  Project = require('core/projects/project');
  ExternalEditorSettings = require('./externalEditorSettings');
  ExternalEditorSettingsView = require('./externalEditorSettingsView');
  ExternalEditorRouter = require("./externalEditorRouter");
  ExternalEditorView = require('./externalEditorView');
  DialogView = require('core/utils/dialogView');
  ExternalEditor = (function(_super) {
    __extends(ExternalEditor, _super);

    ExternalEditor.prototype.title = "ExternalEditor";

    function ExternalEditor(options) {
      this.resetEditor = __bind(this.resetEditor, this);
      this.hideView = __bind(this.hideView, this);
      this.showView = __bind(this.showView, this);
      this.onStart = __bind(this.onStart, this);
      this.init = __bind(this.init, this);
      var _ref, _ref1, _ref2, _ref3;

      ExternalEditor.__super__.constructor.call(this, options);
      this.appSettings = (_ref = options.appSettings) != null ? _ref : null;
      this.settings = (_ref1 = options.settings) != null ? _ref1 : new ExternalEditorSettings();
      this.project = (_ref2 = options.project) != null ? _ref2 : new Project();
      this.vent = vent;
      this.router = new ExternalEditorRouter({
        controller: this
      });
      this.startWithParent = true;
      this.showOnAppStart = false;
      this.addMainMenuIcon = false;
      this.icon = "icon-th-large";
      this.myTitle = (_ref3 = options.title) != null ? _ref3 : 'External Editor';
      this.vent.on("project:loaded", this.resetEditor);
      this.vent.on("project:created", this.resetEditor);
      this.vent.on("ExternalEditor:show", this.showView);
      this.vent.on("ExternalEditor:hide", this.hideView);
      this.init();
    }

    ExternalEditor.prototype.init = function() {
      if (this.appSettings != null) {
        this.appSettings.registerSettingClass("ExternalEditor", ExternalEditorSettings);
      }
      this.addInitializer(function() {
        return this.vent.trigger("app:started", "" + this.title, this);
      });
      console.log("app:started " + this.title);
      return reqRes.addHandler("ExternalEditorSettingsView", function() {
        return ExternalEditorSettingsView;
      });
    };

    ExternalEditor.prototype.onStart = function() {
      this.settings = this.appSettings.get("ExternalEditor");
      if (this.showOnAppStart) {
        return this.showView();
      }
    };

    ExternalEditor.prototype.showView = function() {
      if (this.dia == null) {
        this.dia = new DialogView({
          elName: "externalEditor",
          title: this.myTitle,
          width: 300,
          height: 300,
          position: [525, 25],
          dockable: true
        });
        this.dia.render();
      }
      if (this.externalEditorView == null) {
        this.externalEditorView = new ExternalEditorView({
          model: this.project,
          settings: this.settings
        });
      }
      if (this.dia.currentView == null) {
        return this.dia.show(this.externalEditorView);
      } else {
        return this.dia.showDialog();
      }
    };

    ExternalEditor.prototype.hideView = function() {
      if (this.dia) {
        return this.dia.hideDialog();
      }
    };

    ExternalEditor.prototype.resetEditor = function(newProject) {
      console.log("resetting external editor");
      this.project = newProject;
      if (this.dia != null) {
        console.log("closing current external editor");
        this.dia.close();
        this.ExternalEditorView = null;
      }
      this.loadBlocks();
      return this.showView();
    };

    return ExternalEditor;

  })(Backbone.Marionette.Application);
  return ExternalEditor;
});
