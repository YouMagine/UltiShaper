/* TODO: should open a sketch window.
For every path that is added, a SketchPath block should be added to the canvas.
This class is responsible for managing the SketchPath blocks and triggering a re-render.
*/

function Canvas2d () {
    this.monitorPid = null;
    this.polyLineStr = null;
    this.lastPolyStr = null;
    this.updateState = function() {
		canvas2d.setPolyLineStr(window.localStorage.getItem("2dcanvas.polyString"));
    	if(canvas2d.getPolyLineStr() != canvas2d.lastPolyStr) {
    		console.log("updated",canvas2d.polyLineStr);
    		$(document).trigger('SKETCH_CHANGED');
    	}
    	canvas2d.lastPolyStr = canvas2d.getPolyLineStr();


    }

}

Canvas2d.prototype.getPolyLineStr = function() {
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

var canvas2d = new Canvas2d();
