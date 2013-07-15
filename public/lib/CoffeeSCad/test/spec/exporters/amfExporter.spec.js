// Generated by CoffeeScript 1.6.3
define(function(require) {
  var AmfExporter, Project;
  AmfExporter = require("core/projects/kernel/geometry/exporters/amfExporter");
  Project = require("core/projects/project");
  return describe("AmfExporter ", function() {
    var amfExporter, project;
    project = null;
    amfExporter = null;
    beforeEach(function() {
      project = new Project({
        name: "test_project"
      });
      return amfExporter = new THREE.amfExporter();
    });
    return it('can export a project to amf', function() {
      var expAmf, obsAmf;
      project.addFile({
        name: "test_project.coffee",
        content: "myCube = new Cube({size:[20,20,20]})\nmySphere = new Sphere({r:15, $fn:20})\n\nmyCube.name = \"testCube\"\nmySphere.position.x = 25\n\nassembly.add(myCube)\nassembly.add(mySphere)"
      });
      project.compile();
      obsAmf = amfExporter.parse(project.rootAssembly);
      expAmf = null;
      console.log(obsAmf);
      return expect(obsAmf).toEqual(expAmf);
    });
  });
});
