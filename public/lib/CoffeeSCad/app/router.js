// Generated by CoffeeScript 1.6.3
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function(require) {
  var Controller, Router, app, _ref;
  app = require('app');
  Controller = (function() {
    function Controller() {}

    return Controller;

  })();
  Router = (function(_super) {
    __extends(Router, _super);

    function Router() {
      _ref = Router.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Router.prototype.routes = {
      "": "index"
    };

    Router.prototype.controller = Controller;

    Router.prototype.index = function() {};

    return Router;

  })(Backbone.Router);
  return Router;
});
