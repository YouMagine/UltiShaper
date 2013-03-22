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
 * @fileoverview Blocks for plane demo.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Language.plane_set_seats = {
  // Seat variable setter.
  category: null,
  helpUrl: Blockly.LANG_VARIABLES_SET_HELPURL,
  deletable: false,
  init: function() {
    this.setColour(330);
    this.appendValueInput('VALUE')
        .appendTitle(Blockly.LANG_VARIABLES_SET_TITLE)
        .appendTitle('seats');
    this.setTooltip(Blockly.LANG_VARIABLES_SET_TOOLTIP);
  }
};

Blockly.JavaScript = Blockly.Generator.get('JavaScript');

Blockly.JavaScript.plane_set_seats = function() {
  // Seat variable setter.
  var argument0 = Blockly.JavaScript.valueToCode(this, 'VALUE',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || 'NaN';
  return argument0 + ';';
};

/**
 * 'Set seat' block.
 * @type Blockly.BlocK
 */
var seatsBlock = null;



/**
 * Use the blocks to calculate the number of seats.
 * Display the calculated number.
 */
function recalculate() {
  if (!planeSvg || !seatsBlock) {
    return;
  }
  var seats = NaN;
  var rows = planeSvg.rows;

  var generator = Blockly.Generator.get('JavaScript');
  generator.init();
  var code = generator.blockToCode(seatsBlock);
  try {
    seats = eval(code);
  } catch (e) {
    // Allow seats to remain NaN.
  }
  planeSvg.setText('seatText', 'Seats: ' + (isNaN(seats) ? '?' : seats));
}

/**
 * The SVG's window.
 * @type Window
 */
var planeSvg = null;

/**
 * Callback when the plane's SVG image has loaded.
 * @param {!Window} w The image's window.
 */
function planeLoaded(w) {
  planeSvg = w;
}
