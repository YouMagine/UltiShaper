// Generated by CoffeeScript 1.6.3
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function(require) {
  var $, CoffeeScript, FileCodeView, codeEditor_template, marionette, vent, _;
  $ = require('jquery');
  _ = require('underscore');
  require('bootstrap');
  marionette = require('marionette');
  CoffeeScript = require('CoffeeScript');
  require('coffeelint');
  vent = require('core/messaging/appVent');
  codeEditor_template = require("text!./fileCodeViewAce.tmpl");
  FileCodeView = (function(_super) {
    __extends(FileCodeView, _super);

    FileCodeView.prototype.template = codeEditor_template;

    FileCodeView.prototype.className = "tab-pane";

    FileCodeView.prototype.ui = {
      codeBlock: "#codeArea",
      infoFooter: "#infoFooter"
    };

    function FileCodeView(options) {
      this.onDomRefresh = __bind(this.onDomRefresh, this);
      this.onRender = __bind(this.onRender, this);
      this._setupEditorEventHandlers = __bind(this._setupEditorEventHandlers, this);
      this._onEditorContentChange = __bind(this._onEditorContentChange, this);
      this.redo = __bind(this.redo, this);
      this.undo = __bind(this.undo, this);
      this.updateUndoRedo = __bind(this.updateUndoRedo, this);
      this._updateHints = __bind(this._updateHints, this);
      this._processError = __bind(this._processError, this);
      this._clearLintMarkers = __bind(this._clearLintMarkers, this);
      this._clearErrorMarkers = __bind(this._clearErrorMarkers, this);
      this._clearAllMarkers = __bind(this._clearAllMarkers, this);
      this._onProjectCompileError = __bind(this._onProjectCompileError, this);
      this._onProjectCompiled = __bind(this._onProjectCompiled, this);
      this.settingsChanged = __bind(this.settingsChanged, this);
      this.applyStyles = __bind(this.applyStyles, this);
      this.modelSaved = __bind(this.modelSaved, this);
      this.modelChanged = __bind(this.modelChanged, this);
      this.onClose = __bind(this.onClose, this);
      this.onShow = __bind(this.onShow, this);
      this.onFileClosed = __bind(this.onFileClosed, this);
      this.onFileSelected = __bind(this.onFileSelected, this);
      this.onRefreshRequested = __bind(this.onRefreshRequested, this);
      this._tearDownEventHandlers = __bind(this._tearDownEventHandlers, this);
      this._setupEventHandlers = __bind(this._setupEventHandlers, this);
      FileCodeView.__super__.constructor.call(this, options);
      this.vent = vent;
      this.settings = options.settings;
      this.editor = null;
      this._compileErrorsMarkers = [];
      this._lintErrorsMarkers = [];
      this._setupEventHandlers();
    }

    FileCodeView.prototype._setupEventHandlers = function() {
      console.log("my model", this.model);
      this.model.on("change:content", this.modelChanged);
      this.model.on("saved", this.modelSaved);
      this.settings.on("change", this.settingsChanged);
      this.vent.on("file:closed", this.onFileClosed);
      this.vent.on("file:selected", this.onFileSelected);
      this.vent.on("file:undoRequest", this.undo);
      this.vent.on("file:redoRequest", this.redo);
      this.vent.on("project:compiled", this._onProjectCompiled);
      this.vent.on("project:compile:error", this._onProjectCompileError);
      return this.vent.on("codeEditor:refresh", this.onRefreshRequested);
    };

    FileCodeView.prototype._tearDownEventHandlers = function() {
      this.model.off("change", this.modelChanged);
      this.model.off("saved", this.modelSaved);
      this.settings.off("change", this.settingsChanged);
      this.vent.off("file:closed", this.onFileClosed);
      this.vent.off("file:selected", this.onFileSelected);
      this.vent.off("file:undoRequest", this.undo);
      this.vent.off("file:redoRequest", this.redo);
      this.vent.off("project:compiled", this._onProjectCompiled);
      this.vent.off("project:compile:error", this._onProjectCompileError);
      return this.vent.off("codeEditor:refresh", this.onRefreshRequested);
    };

    FileCodeView.prototype.onRefreshRequested = function(newHeight) {
      this.$el.height(newHeight);
      return this.editor.resize();
    };

    FileCodeView.prototype.onFileSelected = function(model) {
      this.vent.off("project:compiled", this._onProjectCompiled);
      this.vent.off("project:compile:error", this._onProjectCompileError);
      this.vent.off("codeMirror:refresh", this.onRefreshRequested);
      if (model === this.model) {
        this.$el.addClass('active');
        this.$el.removeClass('fade');
        return this.editor.resize();
      } else {
        this.$el.removeClass('active');
        return this.$el.addClass('fade');
      }
    };

    FileCodeView.prototype.onFileClosed = function(fileName) {
      if (fileName === this.model.get("name")) {
        return this.close();
      }
    };

    FileCodeView.prototype.onShow = function() {
      this.$el.addClass('active');
      return this.$el.removeClass('fade');
    };

    FileCodeView.prototype.onClose = function() {
      console.log("closing code view");
      return this._tearDownEventHandlers();
    };

    FileCodeView.prototype.switchModel = function(newModel) {
      console.log("switchin'");
      this.model = newModel;
      this.editor.setValue(this.model.get("content"));
      this.vent.trigger("clearUndoRedo", this);
      this.bindTo(this.model, "change", this.modelChanged);
      return this.bindTo(this.model, "saved", this.modelSaved);
    };

    FileCodeView.prototype.modelChanged = function(model, value) {
      console.log("hey , my model has changed");
      this.applyStyles();
      this.editor.off("change", this._onEditorContentChange);
      this.editor.setValue(this.model.content);
      this.editor.clearSelection();
      return this.editor.on("change", this._onEditorContentChange);
    };

    FileCodeView.prototype.modelSaved = function(model) {};

    FileCodeView.prototype.applyStyles = function() {
      return this.$el.find('[rel=tooltip]').tooltip({
        'placement': 'right'
      });
    };

    FileCodeView.prototype.settingsChanged = function(settings, value) {
      var key, themePath, val, _ref, _results;
      _ref = this.settings.changedAttributes();
      _results = [];
      for (key in _ref) {
        val = _ref[key];
        switch (key) {
          case "fontSize":
            _results.push($(".codeEditorBlock").css("font-size", "" + val + "em"));
            break;
          case "theme":
            themePath = "./theme/" + val;
            _results.push(this.editor.setTheme(themePath));
            break;
          case "autoClose":
            _results.push(this.editor.setBehavioursEnabled(val));
            break;
          case "hightlightLine":
            _results.push(this.editor.setHighlightActiveLine(val));
            break;
          case "showInvisibles":
            _results.push(this.editor.setShowInvisibles(val));
            break;
          case "showIndentGuides":
            _results.push(this.editor.setDisplayIndentGuides(val));
            break;
          case "showGutter":
            _results.push(this.editor.renderer.setShowGutter(val));
            break;
          case "doLint":
            _results.push(this.editor.getSession().setUseWorker(val));
            break;
          default:
            _results.push(void 0);
        }
      }
      return _results;
    };

    FileCodeView.prototype._onProjectCompiled = function() {
      return this._clearErrorMarkers();
    };

    FileCodeView.prototype._onProjectCompileError = function(compileResult) {
      var error, errorLevel, errorLine, errorMsg, i, marker, _ref;
      this._clearErrorMarkers();
      _ref = compileResult.errors;
      for (i in _ref) {
        error = _ref[i];
        errorMsg = error.message;
        errorLine = error.location != null ? error.location.first_line - 1 : 0;
        errorLevel = "error";
        if (!isNaN(errorLine)) {
          marker = {
            row: errorLine,
            column: 0,
            html: "" + errorMsg,
            type: "error"
          };
          this._compileErrorsMarkers.push(marker);
        }
      }
      this.editor.getSession().setAnnotations(this._compileErrorsMarkers);
      return this.applyStyles();
    };

    FileCodeView.prototype._clearAllMarkers = function() {
      this._compileErrorsMarkers = [];
      this._lintErrorsMarkers = [];
      return this.editor.getSession().clearAnnotations();
    };

    FileCodeView.prototype._clearErrorMarkers = function() {
      /*
      for marker in @_compileErrorsMarkers
        @editor.setGutterMarker(marker.line,"lintAndErrorsGutter",  null)
      */

      return this._compileErrorsMarkers = [];
    };

    FileCodeView.prototype._clearLintMarkers = function() {
      return this._lintErrorsMarkers = [];
    };

    FileCodeView.prototype._processError = function(errorMsg, errorLevel, errorLine) {
      var escape, marker, markerDiv, markerDiv$, markerMarkup;
      markerDiv = document.createElement("span");
      markerDiv$ = $(markerDiv);
      escape = function(s) {
        return ('' + s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
      };
      if (errorLevel === "warn") {
        markerDiv$.addClass("CodeWarningMarker");
        markerMarkup = "<a href='#' rel='tooltip' title=\"" + (escape(errorMsg)) + "\"> <i class='icon-remove-sign'></i></a>";
      } else if (errorLevel === "error") {
        markerDiv$.addClass("CodeErrorMarker");
        markerMarkup = "<a href='#' rel='tooltip' title=\"" + (escape(errorMsg)) + "\"> <i class='icon-remove-sign'></i></a>";
      }
      markerDiv$.html(markerMarkup);
      marker = this.editor.setGutterMarker(errorLine, "lintAndErrorsGutter", markerDiv);
      marker.line = errorLine;
      this.editor.getSession().setAnnotations([
        {
          row: errorLine,
          column: 0,
          html: "" + errorMsg,
          type: "error"
        }
      ]);
      return marker;
    };

    FileCodeView.prototype._updateHints = function() {
      var error, errorLevel, errorLine, errorMsg, errors, i, marker;
      this._clearLintMarkers();
      try {
        errors = coffeelint.lint(this.editor.getValue(), this.settings.get("linting"));
        if (errors.length === 0) {
          this.vent.trigger("file:noError");
        } else {
          this.vent.trigger("file:errors", errors);
        }
        for (i in errors) {
          error = errors[i];
          errorMsg = error.message;
          errorLine = error.lineNumber - 1;
          errorLevel = error.level;
          if (!isNaN(errorLine)) {
            marker = this._processError(errorMsg, errorLevel, errorLine);
            this._lintErrorsMarkers.push(marker);
          }
        }
      } catch (_error) {
        error = _error;
        errorLine = error.message.split("line ");
        errorLine = parseInt(errorLine[errorLine.length - 1], 10) - 1;
        errorMsg = error.message;
        if (!isNaN(errorLine)) {
          marker = this._processError(errorMsg, "error", errorLine);
          this._lintErrorsMarkers.push(marker);
        }
        /*
        try
        catch error
          console.log "ERROR #{error} in adding error marker"
        */

      }
      return this.applyStyles();
    };

    FileCodeView.prototype.updateUndoRedo = function() {
      if (this.undoManager.hasRedo()) {
        this.vent.trigger("file:redoAvailable", this);
      } else {
        this.vent.trigger("file:redoUnAvailable", this);
      }
      if (this.undoManager.hasUndo()) {
        return this.vent.trigger("file:undoAvailable", this);
      } else {
        return this.vent.trigger("file:undoUnAvailable", this);
      }
    };

    FileCodeView.prototype.undo = function() {
      if (this.undoManager.hasUndo()) {
        return this.editor.undo();
      }
    };

    FileCodeView.prototype.redo = function() {
      if (this.undoManager.hasRedo()) {
        return this.editor.redo();
      }
    };

    FileCodeView.prototype._onEditorContentChange = function(cm, change) {
      this.model.off("change:content", this.modelChanged);
      this.model.content = this.editor.getValue();
      this.model.on("change:content", this.modelChanged);
      return this.updateUndoRedo();
    };

    FileCodeView.prototype._setupEditorEventHandlers = function() {
      var _this = this;
      this.editor.on("change", this._onEditorContentChange);
      return this.editor.getSession().selection.on('changeCursor', function(ev, selection) {
        var cursor, infoText;
        cursor = selection.anchor;
        infoText = "Line: " + cursor.row + " Column: " + cursor.column;
        return _this.ui.infoFooter.text(infoText);
      });
    };

    FileCodeView.prototype.onRender = function() {
      return $(".codeEditorBlock").css("font-size", "" + (this.settings.get('fontSize')) + "em");
    };

    FileCodeView.prototype.onDomRefresh = function() {
      var UndoManager, ace, themePath;
      ace = require('ace/ace');
      this.editor = ace.edit(this.ui.codeBlock.get(0));
      themePath = "./theme/" + this.settings.theme;
      this.editor.setTheme(themePath);
      this.editor.getSession().setMode("./mode/coffee");
      this.editor.getSession().setTabSize(2);
      this.editor.setBehavioursEnabled(this.settings.autoClose);
      this.editor.setHighlightActiveLine(this.settings.hightlightLine);
      this.editor.setShowInvisibles(this.settings.showInvisibles);
      this.editor.setDisplayIndentGuides(this.settings.showIndentGuides);
      this.editor.renderer.setShowGutter(this.settings.showGutter);
      this.editor.getSession().setUseWorker(this.settings.doLint);
      UndoManager = require("ace/undomanager").UndoManager;
      this.editor.getSession().setUndoManager(new UndoManager());
      this.undoManager = this.editor.getSession().getUndoManager();
      this.editor.resize();
      /* 
      require ['ace/ace'], (ace)=>
        @editor = ace.edit(@ui.codeBlock.get(0))
        @editor.setTheme("./theme/monokai")
        @editor.getSession().setMode("./mode/coffee")
      */

      return this._setupEditorEventHandlers();
    };

    return FileCodeView;

  })(Backbone.Marionette.ItemView);
  return FileCodeView;
});
