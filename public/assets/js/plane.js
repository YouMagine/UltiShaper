/**
 * Visual Blocks Language
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
 * @fileoverview Interactivity for the plane image.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var rows1st = 0;
var rows2nd = 0;
var SVG = document.getElementById('plane');

// TODO: only do updatefunction if the slider output value actually changed.
/**
 * Redraw the rows when the slider has moved.
 * @param {number} value New slider position.
 */
function sliderChange(value) {
  value = 1 - value;
  // var newRows = Math.round((1 - value) * 410 / 20);
  var slider = parent.inputManager.getInput(0);
  var sliderRange = parseFloat(slider.maxVal) - parseFloat(slider.minVal); // 15 -- 15 = 30
  var newRows = (Math.round(value * sliderRange / slider.stepIncrement) * slider.stepIncrement + parseFloat(slider.minVal));
  slider.setVal(newRows);
  if(newRows != slider.lastVal)
    parent.myUpdateFunction();
}

/**
 * Change the text of a label.
 * @param {string} id ID of element to change.
 * @param {string} text New text.
 */
function setText(id, text) {
  var el = document.getElementById(id);
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
  el.appendChild(document.createTextNode(text));
  //attr: style font-weight: bold;
}

// Initialize the slider.
var rowSlider;
var rowSlider2;


function initSlider(sliderNr) {
  var h = sliderNr * 30 + 20;
  if((sliderNr === 0) && (typeof rowSlider === 'undefined')) {
    rowSlider = new Slider(90, h, 425, SVG, sliderChange);
    rowSlider.setValue(1.0);
  }
  if((sliderNr === 1) && (typeof rowSlider2 === 'undefined')) {
    rowSlider2 = new Slider(90, h, 425, SVG, sliderChange);
    rowSlider2.setValue(0.1);
  }
}

if (parent.planeLoaded) {
  // Give the parent page a handle to this window.
  parent.planeLoaded(window);
} else {
  // Attempt to diagnose the problem.
  var msg = 'Error: Unable to communicate between HTML & SVG.\n\n';
  if (window.location.protocol == 'file:') {
    msg += 'This may be due to a security restriction preventing\n' +
        'access when using the file:// protocol.\n' +
        'http://code.google.com/p/chromium/issues/detail?id=47416';
  }
  alert(msg);
}
// Draw five 1st class rows.
// parent.redraw(5);
