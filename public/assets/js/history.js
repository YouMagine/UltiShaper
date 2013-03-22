function History (undoRedoFunc) {
    this.numEntries = 0;
    this.entries = [];
    this.performUndoRedoFunc = undoRedoFunc;
    this.entriesUndone = [];
    this.performingUndo = false;
    this.lastEntry = '';
}

History.prototype.getNumEntries = function() {
    return this.entries.length;
};

History.prototype.getEntries = function() {
    return this.entries;
};

History.prototype.setRedoFunc = function(undoRedoFunc) {
    this.performUndoRedoFunc = undoRedoFunc;
};

History.prototype.toString = function() {
    return this.getNumEntries() + ' actions were performed.';
};
History.prototype.addEntry = function(entry) {
	if(entry == this.lastEntry)
		{
			console.log("entry is identical to last item in history buffer. Not storing this one.");
			return false;
		}
	if(this.performingUndo === true) {
		console.log("undo: Performing an undo. This triggered a change, but I'm smart, so I wont add it as an entry.");
		return false;
	}
	this.entriesUndone = []; // reset redo buffer!
	this.lastEntry == entry;
	this.entries.unshift(entry);
	return true;
};

History.prototype.undo = function() {
	this.performingUndo = true;
	var lastEntry = this.entries.shift();
	// lastEntry = this.entries.shift(); // FIXME: do we need to skip history entries? Then, why store it???
	this.entriesUndone.push(lastEntry); // add to redo buffer
	console.log('entry undone',this.entriesUndone);
	var ret = this.performUndoRedoFunc.call(this,true,lastEntry);
	// to prevent a history entry being created through undo...
	setTimeout(function(){this.performingUndo = false;},20);

	return ret;
};
History.prototype.redo = function() {
	var entry = this.entriesUndone.pop();
	console.log(entry);
	return this.performUndoRedoFunc.call(this,true,entry);
};

// FIXME: prevent that the undo will add to the history!

var hist = new History();
hist.setRedoFunc(function(isUndo,data){
	if(!data) { window.alert("Cannot undo/redo anymore. There are no actions in the history."); return false; }
	// clear all blocks
	clearWorkspace();
	// add XML from previous
	try {
		var xml = Blockly.Xml.textToDom(data);
		Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
	} catch(err){
		console.log("Undo: something went wrong. Cannot go back... sorry.");
		return false;
	}
});

