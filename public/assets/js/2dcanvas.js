/* TODO: should open a sketch window.
For every path that is added, a SketchPath block should be added to the canvas.
This class is responsible for managing the SketchPath blocks and triggering a re-render.
*/

function Canvas2d () {
    this.monitorPid = null;
    this.polyLineStr = null;
    this.lastPolyStr = null;
    this.isWindowOpen = false;
    this.dialog = null;
    this.updateState = function() {
		canvas2d.setPolyLineStr(window.localStorage.getItem("2dcanvas.polyString"));
    	if(canvas2d.getPolyLineStr() != canvas2d.lastPolyStr) {
    		console.log("updated",canvas2d.polyLineStr);
    		$(document).trigger('SKETCH_CHANGED');
    	}
    	canvas2d.lastPolyStr = canvas2d.getPolyLineStr();


    }


    // Create the Canvas2d div.
    // var div = document.createElement('div');
    // div.id = 'canvas2d';
    // document.body.appendChild(div);
    $("body").append($("<div id=\"canvas2d\" />"));
    this.dialog = $("#canvas2d").dialog({  //create dialog, but keep it closed
	   autoOpen: false,
	   title: "2D path editor",
	   height: 400,
	   width: 650,
	   modal: false
	});

}

Canvas2d.prototype.addBlock = function(block) {
	// This method gets run when a Sketch path block is dropped onto the canvas.

	// Ensure the 2D canvas is open
	this.openWindow();

};

Canvas2d.prototype.openWindow = function() {
	this.dialog.dialog("open");
	if(this.isWindowOpen == true) {
		//TODO: check if it was closed in some other way...
		return;
	} else {
	$("#canvas2d").append($("<iframe />").attr({src: "/lib/poly-editor/index.html",style: " width:100%; height:100%; border:0 none;"}));
	this.dialog.dialog("open");
  	$($('#canvas2d').offsetParent()).css('z-index','3000');

	}

};
Canvas2d.prototype.getPolyLineStr = function() {
	if(this.polyLineStr != null)
    	return this.polyLineStr.trim();
};
Canvas2d.prototype.isMonitoring = function() {
    return (this.monitorPid !== null);
};
Canvas2d.prototype.setPolyLineStr = function(str) {
    this.polyLineStr = str;
    // if(typeof this.onChangeFunc === 'function')
		// this.onChangeFunc.call();
};

Canvas2d.prototype.startMonitoring = function(intervalMs) {
	intervalMs = intervalMs || 1500;
	console.log("starting to monitor for 2d canvas changes.");
	if(this.monitorPid !== null) 
		window.clearInterval(this.monitorPid);

    // if(typeof this.onChangeFunc === 'function') {
		// this.onChangeFunc.call();
    	// this.monitorPid = window.setInterval(this.onChangeFunc,intervalMs);
	// }
	this.updateState.call();
    this.monitorPid = window.setInterval(this.updateState,intervalMs);
};

var canvas2d = null;
$(document).ready(function(){
	canvas2d = new Canvas2d();
	

});
