// uuid
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
}

function uuid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}



// Below is a copy of the Blockly.Field into Blockly.HiddenField

/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Input field.  Used for editable titles, variables, etc.
 * This is an abstract class that defines the UI on the block.  Actual
 * instances would be Blockly.HiddenFieldTextInput, Blockly.HiddenFieldDropdown, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.HiddenField');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.BlockSvg');


/**
 * Class for an editable field.
 * @param {string} text The initial content of the field.
 * @constructor
 */
Blockly.HiddenField = function(text) {
  this.sourceBlock_ = null;
  // Build the DOM.
  this.group_ = Blockly.createSvgElement('g', {}, null);
  this.textElement_ = Blockly.createSvgElement('text',
      {'class': 'blocklyText'}, this.group_);
  if (this.CURSOR) {
    // Different field types show different cursor hints.
    this.group_.style.cursor = this.CURSOR;
  }
  this.size_ = {height: 25, width: 0};
  this.setText(text);
};

/**
 * Non-breaking space.
 */
Blockly.HiddenField.NBSP = '\u00A0';

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.HiddenField.prototype.EDITABLE = true;

/**
 * Install this field on a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.HiddenField.prototype.init = function(block) {
  if (this.sourceBlock_) {
    throw 'Field has already been initialized once.';
  }
  this.sourceBlock_ = block;
  this.group_.setAttribute('class',
      block.editable ? 'blocklyEditableText' : 'blocklyNonEditableText');
  block.getSvgRoot().appendChild(this.group_);
  if (block.editable) {
    this.mouseUpWrapper_ =
        Blockly.bindEvent_(this.group_, 'mouseup', this, this.onMouseUp_);
  }
};

/**
 * Dispose of all DOM objects belonging to this editable field.
 */
Blockly.HiddenField.prototype.dispose = function() {
  if (this.mouseUpWrapper_) {
    Blockly.unbindEvent_(this.mouseUpWrapper_);
    this.mouseUpWrapper_ = null;
  }
  this.sourceBlock_ = null;
  goog.dom.removeNode(this.group_);
  this.group_ = null;
  this.textElement_ = null;
  this.borderRect_ = null;
};

/**
 * Sets whether this editable field is visible or not.
 * @param {boolean} visible True if visible.
 */
Blockly.HiddenField.prototype.setVisible = function(visible) {
  this.getRootElement().style.display = visible ? 'block' : 'none';
};


/**
 * Gets the group element for this editable field.
 * Used for measuring the size and for positioning.
 * @return {!Element} The group element.
 */
Blockly.HiddenField.prototype.getRootElement = function() {
  return /** @type {!Element} */ (this.group_);
};

/**
 * Cache of text lengths.
 * Blockly has a lot of repeating strings (if, then, do, etc).  Only measure
 * their lengths once.  Subsequent instances can be looked up in this cache.
 */
Blockly.HiddenField.textLengthCache = {};

/**
 * Draws the border with the correct width.
 * Saves the computed width in a property.
 * @private
 */
Blockly.HiddenField.prototype.render_ = function() {
  this.getRootElement().style.display = 'none';
  this.size_.width = 0;
};

/**
 * Returns the height and width of the title.
 * @return {!Object} Height and width.
 */
Blockly.HiddenField.prototype.getSize = function() {
  if (!this.size_.width) {
    this.render_();
  }
  return this.size_;
};

/**
 * Get the text from this field.
 * @return {string} Current text.
 */
Blockly.HiddenField.prototype.getText = function() {
  return this.text_;
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {?string} text New text.
 */
Blockly.HiddenField.prototype.setText = function(text) {
  if (text === null) {
    // No change if null.
    return;
  }
  this.text_ = text;
  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @return {string} Current text.
 */
Blockly.HiddenField.prototype.getValue = function() {
  return this.getText();
};

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @param {string} text New text.
 */
Blockly.HiddenField.prototype.setValue = function(text) {
  this.setText(text);
};

/**
 * Handle a mouse up event on an editable field.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.HiddenField.prototype.onMouseUp_ = function(e) {
  if (Blockly.isRightButton(e)) {
    // Right-click.
    return;
  } else if (Blockly.Block.dragMode_ == 2) {
    // Drag operation is concluding.  Don't open the editor.
    return;
  }
  // Non-abstract sub-classes must define a showEditor_ method.
  this.showEditor_();
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.HiddenField.prototype.setTooltip = function(newTip) {
  // Non-abstract sub-classes may wish to implement this.  See FieldLabel.
};
