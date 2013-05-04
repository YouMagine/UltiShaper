// Generated by CoffeeScript 1.6.2
define(function(require) {
  var log,
    _this = this;

  log = {};
  log.level = 1;
  log.DEBUG = 0;
  log.INFO = 1;
  log.WARN = 2;
  log.ERROR = 3;
  log.entries = [];
  log.debug = function(message) {
    var lineNumber;

    if (log.level <= log.DEBUG) {
      lineNumber = (new Error()).lineNumber;
      return log.entries.push({
        lvl: "DEBUG",
        msg: "" + message,
        line: lineNumber
      });
    }
  };
  log.info = function(message) {
    var lineNumber;

    if (log.level <= log.INFO) {
      lineNumber = (new Error()).lineNumber;
      return log.entries.push({
        lvl: "INFO",
        msg: "" + message,
        line: lineNumber
      });
    }
  };
  log.warn = function(message) {
    var lineNumber;

    if (log.level <= log.WARN) {
      lineNumber = (new Error()).lineNumber;
      return log.entries.push({
        lvl: "WARN",
        msg: "" + message,
        line: lineNumber
      });
    }
  };
  log.error = function(message, lineNumber) {
    if (lineNumber == null) {
      lineNumber = (new Error()).lineNumber;
    }
    if (log.level <= log.ERROR) {
      return log.entries.push({
        lvl: "ERROR",
        msg: "" + message,
        line: lineNumber
      });
    }
  };
  return {
    "log": log
  };
});
