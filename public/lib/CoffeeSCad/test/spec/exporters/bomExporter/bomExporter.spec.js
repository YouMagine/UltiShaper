// Generated by CoffeeScript 1.6.2
define(function(require) {
  var BomExporter, Project;

  BomExporter = require("exporters/bomExporter/bomExporter");
  Project = require("core/projects/project");
  return describe("BomExporter", function() {
    var bomExporter, project;

    project = null;
    bomExporter = null;
    beforeEach(function() {
      project = new Project({
        name: "testProject"
      });
      return bomExporter = new BomExporter();
    });
    it('can export a project to bom (blobUrl)', function() {
      var blobUrl;

      project.addFile({
        name: "testProject.coffee",
        content: "class TestPart extends Part\n  constructor:(options) ->\n    super options\n    @union(new Cylinder(h:300, r:20,$fn:3))\n\ntestPart = new TestPart()\nassembly.add(testPart)"
      });
      project.compile();
      blobUrl = bomExporter["export"](project.rootAssembly);
      return expect(blobUrl).not.toBe(null);
    });
    it('triggers an bomExport:error event when export fails', function() {
      var errorArgs, errorCallback;

      project.addFile({
        name: "testFileName"
      });
      errorCallback = jasmine.createSpy('-error event callback-');
      bomExporter.vent.on("bomExport:error", errorCallback);
      bomExporter["export"](project);
      errorArgs = errorCallback.mostRecentCall.args;
      expect(errorArgs).toBeDefined();
      return expect(errorArgs[0].message).toBe(" ");
    });
    return it('fail gracefully when export fails', function() {
      var blobUrl;

      project.addFile({
        name: "testFileName"
      });
      blobUrl = bomExporter["export"](project.rootAssembly);
      return expect(blobUrl).toBe("data:text/json;charset=utf-8,undefined");
    });
  });
});
