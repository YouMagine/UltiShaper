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
function sliderChange(value,uuid) {
  value = 1 - value;
  // var newRows = Math.round((1 - value) * 410 / 20);
  var slider = parent.inputManager.getInputByUUID(uuid);
  if (slider === null) { console.log('uuid',uuid,'doesn\'t exist (anymore).');return; }
  var sliderRange = parseFloat(slider.maxVal) - parseFloat(slider.minVal); // 15 -- 15 = 30
  var newRows = (Math.round(value * sliderRange / slider.stepIncrement) * slider.stepIncrement + parseFloat(slider.minVal));
  slider.setVal(newRows);
  slider.sliderObj.setValueText(newRows);
  if(newRows != slider.lastVal) {
    console.log("Changed ",slider.sliderName,'from',slider.lastVal,'to',slider.val);
    parent.myUpdateFunction();
  }
}

// Initialize the slider.
// var rowSlider;
// var rowSlider2;


function initSlider(sliderNr,uuid,sliderLabel) {
  var h = sliderNr * 30 + 20;
  var sliderObj;
  console.log('init sliderObj '+sliderNr+' with uuid '+uuid+' and height '+h);
  var sliderObjGone = false;
  if(!document.getElementById('input'+uuid))
      sliderObjGone = true;
  if((sliderNr === 0) && (sliderObjGone)) {
    //                    (x, y, width, svgParent, opt_changeFunc,uuid)
    sliderObj = new Slider(90, h, 425, SVG, sliderChange,uuid); 
    sliderObj.setValue(1.0);
    sliderObj.setLabel(sliderLabel,h+2);
  }
  if((sliderNr === 1) && (sliderObjGone)) {
    sliderObj = new Slider(90, h, 425, SVG, sliderChange,uuid);
    sliderObj.setValue(1.0);
    sliderObj.setLabel(sliderLabel,h+2);
  }
  return sliderObj;
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
