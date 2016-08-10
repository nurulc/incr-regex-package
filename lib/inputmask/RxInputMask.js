/*
Copyright (c) 2016, Nurul Choudhury

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/

//
// Modified from https://github.com/insin/inputmask-core
//  This was originally written by insin - on GIT hub
//  The code worked fine for fixed formatted input mask, but is not so useful for
//  varible mask based on regular expression (RegExp)
//  That capability regires this implementation of Regexp, and provides incremental processing of regular expression
// Amost the entire original code has been replaces but the original interfaces remain
//
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RXInputMask = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.trimHolder = trimHolder;
exports._after = _after;

var _utils = require("../utils");

var _incrRegexV = require("../incr-regex-v3");

var _RxMatcher = require("../RxMatcher");

var _regexpParser = require("../regexp-parser");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function has(object, key) {
  return object ? hasOwnProperty.call(object, key) : false;
}

function newSel(s, e) {
  e = e || s;return { start: Math.min(s, e), end: Math.max(s, e) };
}
function selPlus(sel, x, y) {
  return clip(newSel(sel.start + x, sel.end + (y === undefined ? x : y)));
}
function clip(sel, range, clipFnAfter, clipFnBefore) {
  clipFnAfter = clipFnAfter || function (x) {
    return x;
  };
  clipFnBefore = clipFnBefore || clipFnAfter;
  var clp = function clp(x, r, clipFn) {
    return clipFn(Math.max(Math.min(x, r.end), r.start));
  };
  return !range ? sel : { start: clp(sel.start, range, clipFnBefore),
    end: clp(sel.end, range, clipFnAfter) };
}
function zero(x) {
  return !(x || 0);
}
function selRange(sel) {
  return sel ? sel.end - sel.start : 0;
}
function zeroRange(sel) {
  return zero(selRange(sel));
}
function backward(oldSelV, newSelV) {
  return oldSelV.start > newSelV.start;
}

var RXInputMask = exports.RXInputMask = function () {
  function RXInputMask(options) {
    _classCallCheck(this, RXInputMask);

    options = (0, _utils.assign)({
      pattern: null,
      selection: { start: 0, end: 0 },
      value: '',
      history: { data: [], index: null, lastOp: null }
    }, options);

    if (options.pattern === null) {
      throw new Error('RXInputMask: you must provide a pattern.');
    }

    this.setPattern(options.pattern, {
      value: options.value,
      selection: options.selection,
      history: options.history
    });
  }

  _createClass(RXInputMask, [{
    key: "getState",
    value: function getState() {
      var options = {
        pattern: this.pattern.clone(),
        selection: selPlus(this.selection, 0),
        value: this._getValue(),
        history: { data: [], index: null, lastOp: null }
      };
    }

    /**
     * Applies a single character of input based on the current selection.
     * @param {string} char
     * @return {boolean} true if a change has been made to value or selection as a
     *   result of the input, false otherwise.
     */

  }, {
    key: "input",
    value: function input(char) {
      // Ignore additional input if the cursor's at the end of the pattern
      if (zeroRange(this.selection) && this.pattern.isDone(this.selection.start)) {
        // to do find out if we are at the end
        return false;
      }

      var _input2 = this._input(char, this.selection, this.pattern);

      var _input3 = _slicedToArray(_input2, 3);

      var result = _input3[0];
      var newSel = _input3[1];
      var newPat = _input3[2]; // returns [status:boolean, newSelection, newPattern]

      if (!result) return false;

      var valueBefore = this._getValue();

      var selectionBefore = this.selection;
      var patternBefore = this.pattern;


      this._lastOp = 'input';
      this.selection = newSel;
      this.pattern = newPat;
      this.value = this.getValue();

      // History
      if (this._historyIndex !== null) {
        // Took more input after undoing, so blow any subsequent history away
        //console.log('splice(', this._historyIndex, this._history.length - this._historyIndex, ')');
        this._history.splice(this._historyIndex, this._history.length - this._historyIndex);
        this._historyIndex = null;
      }
      if (this._lastOp !== 'input' || !zeroRange(selectionBefore) || this._lastSelection !== null && selectionBefore.start !== this._lastSelection.start) {
        this._history.push({ value: valueBefore, selection: selectionBefore, lastOp: this._lastOp, pattern: patternBefore });
      }

      this._lastSelection = selectionBefore;
      return true;
    }

    /**
    * Internal method to add a character at the current position
    * move all the characters. When inserting subsequent characters
    * the syatem tries to take care of the fixed characters
    * this is the same as the public input() method but it does not update history
    * 
    *  returns:  [status:boolean, newSelection:Selection, newPattern:]
    *
    */

  }, {
    key: "_input",
    value: function _input(ch, selection, aPattern) {

      // check if we are under an empty slot, then we can set the value there without moving anything
      if (zeroRange(selection) && aPattern.emptyAt(selection.start)) {
        selection = selPlus(selection, 1); ////newPattern.getFirstEditableAtOrAfter(selection.end+1);
      }

      var newPattern = aPattern.clone(); // copy the current
      selection = this._updateSelection(selection, newPattern.getFirstEditableAtOrAfter(selection.start)); // start from the first editable position
      var endPos = newPattern.getFirstEditableAtOrAfter(selection.end);
      var textAfterSelection = _after(newPattern, false, endPos); // get the raw value
      var inputIndex = selection.start;
      newPattern.setPos(inputIndex);

      if (ch !== undefined && !_skipAndMatch(newPattern, ch)) {
        // but first make sure we did not enter a fixed character
        return [false, selection, newPattern];
      }
      selection = this._updateSelection(selection, newPattern.getInputLength());
      endPos = Math.max(endPos, selection.end);
      var newPos = newPattern.getFirstEditableAtOrAfter(newPattern.getInputLength());
      // Put back the remainder
      //

      var resultPattern = this._insertRest(textAfterSelection, newPattern, inputIndex, endPos + 1);
      _fillInFixedValuesAtEnd(resultPattern || newPattern);

      // Advance the cursor to the next character
      return [true, newSel(newPos, newPos), resultPattern || newPattern];
    }
  }, {
    key: "_insertRest",
    value: function _insertRest(textToAdd, aPattern, inputIndex, endIndex) {
      function _ins(textPos, textToAdd, aPattern, inputIndex, endIndex) {
        if (textPos >= textToAdd.length) return aPattern;
        if (inputIndex > endIndex || aPattern.isDone()) return aPattern;
        var alt = aPattern.clone();
        if (_skipAndMatch(alt, textToAdd.charAt(textPos))) {
          var res = _ins(textPos + 1, textToAdd, alt, alt.getInputLength() - 1, endIndex);
          if (res !== undefined) return res;
        }
        //console.log("rx", aPattern);
        while (_skipFixed(aPattern, false)) {}
        aPattern.match(undefined);
        return _ins(textPos, textToAdd, aPattern, inputIndex + 1, endIndex);
      }
      //textToAdd = trimHolder(textToAdd);
      var retV = _ins(0, textToAdd, aPattern, inputIndex, endIndex + textToAdd.length);
      //while(aPattern.skipFixed(true));
      return retV;
    }

    /**
     * Attempts to delete from the value based on the current cursor position or
     * selection.
     * @return {boolean} true if the value or selection changed as the result of
     *   backspacing, false otherwise.
     */

  }, {
    key: "backspace",
    value: function backspace() {
      // If the cursor is at the start there's nothing to do
      var firstIx = this.pattern.getFirstEditableAtOrAfter(0);
      if (this.selection.start < firstIx || this.selection.end < firstIx) {
        return false;
      }

      var selectionBefore = (0, _utils.copy)(this.selection);
      var valueBefore = this._getValue();
      var _selection = this.selection;
      var start = _selection.start;
      var end = _selection.end;

      // No range selected - work on the character preceding the cursor

      if (start === end) {
        start = this.pattern.getFirstEditableAtOrBefore(start - 1);
        end = start + 1;
        if (start < firstIx) return;
      }
      // Range selected - delete characters and leave the cursor at the start of the selection
      else {
          //end = this.pattern.getFirstEditableAtOrBefore(end);

          start = this.pattern.getFirstEditableAtOrBefore(end < start ? end : start);
          if (end === start) {
            end++;
          }

          if (end <= firstIx) return;
        }
      var result = this._input(undefined, newSel(start, end), this.pattern);
      var patternBefore = this.pattern;
      if (!result[0]) return false;
      this.pattern = result[2];
      this.selection.start = this.selection.end = start;
      //console.log("Before:", selectionBefore, " After:",this.selection);

      // History
      if (this._historyIndex !== null) {
        // Took more input after undoing, so blow any subsequent history away
        this._history.splice(this._historyIndex, this._history.length - this._historyIndex);
      }
      if (this._lastOp !== 'backspace' || selectionBefore.start !== selectionBefore.end || this._lastSelection !== null && selectionBefore.start !== this._lastSelection.start) {
        this._history.push({ value: valueBefore, selection: selectionBefore, lastOp: this._lastOp, pattern: patternBefore });
      }
      this._lastOp = 'backspace';
      this._lastSelection = (0, _utils.copy)(selectionBefore);

      return true;
    }
  }, {
    key: "del",
    value: function del() {
      if (zeroRange(this.selection)) {
        this.right(this.selection);
        return this.backspace();
      } else return this.backspace();
    }

    /**
     * Attempts to paste a string of input at the current cursor position or over
     * the top of the current selection.
     * Invalid content at any position will cause the paste to be rejected, and it
     * may contain static parts of the mask's pattern.
     * @param {string} input
     * @return {boolean} true if the paste was successful, false otherwise.
     */

  }, {
    key: "paste",
    value: function paste(input) {
      // This is necessary because we're just calling input() with each character
      // and rolling back if any were invalid, rather than checking up-front.
      var initialState = {
        value: this.value.slice(),
        selection: (0, _utils.copy)(this.selection),
        _lastOp: this._lastOp,
        _history: this._history.slice(),
        _historyIndex: this._historyIndex,
        _lastSelection: (0, _utils.copy)(this._lastSelection),
        pattern: this.pattern.clone()
      };

      // If there are static characters at the start of the pattern and the cursor
      // or selection is within them, the static characters must match for a valid
      // paste.
      var rest = this.getRawValueAt(this.selection.end); // get raw value from the pattern

      this.pattern.setPos(this.selection.start);
      var insVal = this._setValueFrom(this.selection.start, input);
      this.selection.end = this.pattern.getInputLength();
      if (!insVal || !this._setValueFrom(this.selection.end, rest)) {
        (0, _utils.assign)(this, initialState);
        return false;
      }

      return true;
    }

    // History

  }, {
    key: "undo",
    value: function undo() {
      // If there is no history, or nothing more on the history stack, we can't undo
      if (this._history.length === 0 || this._historyIndex === 0) {
        return false;
      }

      var historyItem;
      if (this._historyIndex === null) {
        // Not currently undoing, set up the initial history index
        this._historyIndex = this._history.length - 1;
        historyItem = this._history[this._historyIndex];
        // Add a new history entry if anything has changed since the last one, so we
        // can redo back to the initial state we started undoing from.
        var value = this._getValue();
        if (historyItem.value !== value || historyItem.selection.start !== this.selection.start || historyItem.selection.end !== this.selection.end) {
          this._history.push({ value: value, selection: (0, _utils.copy)(this.selection), lastOp: this._lastOp, startUndo: true, pattern: this.pattern.clone() });
        }
      } else {
        historyItem = this._history[--this._historyIndex];
      }

      this.pattern = historyItem.pattern;
      this.setValue(historyItem.value);
      this.selection = historyItem.selection;
      this._lastOp = historyItem.lastOp;
      return true;
    }
  }, {
    key: "redo",
    value: function redo() {
      if (this._history.length === 0 || this._historyIndex === null) {
        return false;
      }
      var historyItem = this._history[++this._historyIndex];
      // If this is the last history item, we're done redoing
      if (this._historyIndex === this._history.length - 1) {
        this._historyIndex = null;
        // If the last history item was only added to start undoing, remove it
        if (historyItem.startUndo) {
          this._history.pop();
        }
      }
      this.pattern = historyItem.pattern.clone();
      this.setValue(historyItem.value);
      this.selection = historyItem.selection;
      this._lastOp = historyItem.lastOp;

      return true;
    }
  }, {
    key: "left",
    value: function left(selection) {
      var sel = (0, _utils.copy)(selection);
      if (sel && zeroRange(sel)) {
        sel.start = sel.end = selection.start - 1;
        this.setSelection(sel);
      }
      return this;
    }
  }, {
    key: "right",
    value: function right(selection) {
      var sel = (0, _utils.copy)(selection);
      if (sel && sel.start === sel.end) {
        sel.start = sel.end = selection.start + 1;
        this.setSelection(sel);
      }
      return this;
    }

    // Getters & setters

  }, {
    key: "setPattern",
    value: function setPattern(pattern, options) {
      options = (0, _utils.assign)({
        //       selection: {start: 0, end: 0},
        value: ''
      }, options);
      this.pattern = new _RxMatcher.RxMatcher((0, _incrRegexV.incrRegEx)(pattern));
      this.setValue(options.value);
      this.emptyValue = this.pattern.minChars();
      this.setSelection(options.selection);
      while (this.skipFixed(true)) {}
      if (zeroRange(this.selection) && this.pattern.getInputTracker().length !== 0) {
        var ss = this._getValue();
        this.setValue(ss);
        this.selection.start = this.selection.end = ss.length;
      }
      this._resetHistory();
      return this;
    }
  }, {
    key: "select",
    value: function select(low, high) {
      this.selection = high < low ? newSel(high, low) : newSel(low, high);
      return this;
    }
  }, {
    key: "setSelection",
    value: function setSelection(selection) {
      var _this = this;

      var sel = selection === this.selection ? this.selection : (0, _utils.copy)(selection);
      var old = this.selection || sel;
      var fea = function fea(x) {
        return _this.pattern.getFirstEditableAtOrAfter(x);
      };
      var feb = function feb(x) {
        return _this.pattern.getFirstEditableAtOrBefore(x);
      };
      this.selection = old;
      var firstEditableIndex = fea(0); // first editable after
      var lastEditableIndex = this.pattern.lastEditableIndex();
      var range = newSel(firstEditableIndex, lastEditableIndex);
      if (zeroRange(sel)) {
        this.selection = clip(sel, range, backward(this.selection, sel) ? feb : fea);
      } else {
        this.selection = clip(sel, range, fea, feb);
      }
      return this;
    }
  }, {
    key: "_adjustSelection",
    value: function _adjustSelection(sel, forward) {
      if (zeroRange(sel)) {
        return newSel(forward ? this.pattern.getFirstEditableAtOrAfter(sel.start) : this.pattern.getFirstEditableAtOrBefore(sel.start));
      }
      return newSel(this.pattern.getFirstEditableAtOrBefore(sel.start), this.pattern.getFirstEditableAtOrAfter(sel.end));
    }
  }, {
    key: "_setValueFrom",
    value: function _setValueFrom(ix, str) {
      var newPattern = this.pattern.clone();
      var success = true;
      if (ix !== undefined) newPattern.setPos(ix);
      for (var i = ix, j = 0; j < str.length && success; i++, j++) {
        var c = str.charAt(j);
        success &= _skipAndMatch(newPattern, c);
      }
      if (success) {
        _fillInFixedValuesAtEnd(newPattern);
        this.pattern = newPattern;
      }
      return success;
    }
  }, {
    key: "setValue",
    value: function setValue(value) {
      var lg = new Logger("RXInputMask:");
      if (this.getValue() === value) {
        // lg.println("no change to:",value ).flush();
        return true;
      }
      var workingPattern = this.pattern.clone();
      if (value === null) {
        value = '';
      }
      workingPattern.reset();
      lg.println("iterate over", value, "length:", value.length);
      for (var i = 0; i < value.length; i++) {
        var c = value.charAt(i);
        lg.print("index: ", i, "char:", c, "minChars:", workingPattern.minChars(), "sameAsRest", sameAsRest(value.substring(i), workingPattern.minChars()), "---");
        if (sameAsRest(value.substring(i), workingPattern.minChars())) break;
        if ((0, _incrRegexV.isHolder)(c)) c = undefined;
        if (!_skipAndMatch(workingPattern, c)) {
          return false;
        }
      }

      //_fillInFixedValuesAtEnd(this.pattern);
      this.pattern = workingPattern;
      this.value = this.getValue();
      return true;
    }
  }, {
    key: "minCharsList",
    value: function minCharsList(flag) {
      //if( !flag ) throw new Error("flag should be true");
      return this.pattern.minCharsList(flag);
    }
  }, {
    key: "getSelection",
    value: function getSelection() {
      return (0, _utils.copy)(this.selection);
    }
  }, {
    key: "_getValue",
    value: function _getValue() {
      return _after(this.pattern, true, 0);
    }
  }, {
    key: "getValue",
    value: function getValue() {
      return _after(this.pattern, true, 0) + this.pattern.minChars(); //.valueWithMask();
      //return this.pattern.rawValue(0);
      //return this._getValue()
    }
  }, {
    key: "getRawValue",
    value: function getRawValue() {
      return _after(this.pattern, false, 0);
    }
  }, {
    key: "getRawValueAt",
    value: function getRawValueAt(ix) {
      return _after(this.pattern, false, ix);
    }
  }, {
    key: "reset",
    value: function reset() {
      this.pattern.reset();
      this._resetHistory();
      this.value = this.getValue();
      this.selection.start = this.selection.end = 0;
      this.setSelection(this.selection);
      return this;
    }
  }, {
    key: "_resetHistory",
    value: function _resetHistory() {
      this._history = [];
      this._historyIndex = null;
      this._lastOp = null;
      this._lastSelection = (0, _utils.copy)(this.selection);
      return this;
    }
  }, {
    key: "_updateSelection",
    value: function _updateSelection(aSelection, start) {
      var res = (0, _utils.copy)(aSelection);
      res.start = start;
      if (start > res.end) res.end = start;
      return res;
    }
  }, {
    key: "skipFixed",
    value: function skipFixed(flag) {
      return _skipFixed(this.pattern, flag);
    }
  }, {
    key: "isDone",
    value: function isDone() {
      var pattern = this.pattern.clone();
      var value = this.getValue();
      var list = value.split('');
      console.log("isDone: ", value);
      if ((0, _utils.arr_find)(function (e) {
        return (0, _incrRegexV.isHolder)(e);
      }, list)) return "MORE";

      pattern.reset();
      for (var i = 0; i < list.length; i++) {
        if ((0, _incrRegexV.isMeta)(list[i])) continue;
        if (!pattern.match(list[i])) return "MORE";
      }
      console.log("isDone: state", pattern.stateStr());
      return pattern.stateStr();
    }
  }]);

  return RXInputMask;
}();

// *pattern Helpers

function sameAsRest(str, rest) {
  if (str === rest) return true;
  return false; //( isMeta(rest[0]) && str === rest.substring(1,rest.length) ) ;
}

function _fillInFixedValuesAtEnd(pattern) {
  var s = pattern.minChars();
  var i = 0;
  for (; s.length > i && !(0, _incrRegexV.isMeta)(s.charAt(0)); i++) {
    if (!pattern.match(s.charAt(0))) return i > 0;
    s = pattern.minChars();
  }
  return i > 0;
}

function _skipFixed(aPattern, onlyFixed) {
  var s = aPattern.minChars();
  onlyFixed = !!onlyFixed;
  if (onlyFixed !== true && s.length > 1 && (0, _incrRegexV.isOptional)(s.charAt(0)) && !(0, _incrRegexV.isMeta)(s.charAt(1))) {
    if (aPattern.match(s.charAt(1))) return true;
  } else if ( /* onlyFixed === true && */s.length > 0 && !(0, _incrRegexV.isMeta)(s.charAt(0))) return aPattern.match(s.charAt(0));
  return false;
}

function _skipAndMatch(aPattern, ch) {
  if (aPattern.match(ch)) return true;
  var backup = aPattern.clone();
  while (_skipFixed(aPattern, false)) {
    if (aPattern.match(ch)) return true;
  }
  aPattern.reset();
  aPattern.matchStr(_after(backup, true, 0));
  return false;
}

function trimHolder(textToAdd) {
  var i = textToAdd.length - 1;
  for (; i >= 0 && (0, _incrRegexV.isHolder)(textToAdd.charAt(i)); i--) {}
  return textToAdd.substring(0, i + 1);
}

function _after(aPattern, all, ix) {
  /* public */ // get the input matched so far after ix.
  var tracker = aPattern.getInputTracker();
  if (!ix) {
    var al = all ? tracker : tracker.filter(function (e) {
      return e[1] === undefined;
    });
    return al.map(function (e) {
      return e[0];
    }).join('');
  } else {
    var _al = tracker.filter(function (e, i) {
      return i >= ix && (all || e[1] === undefined);
    });
    return _al.map(function (e) {
      return e[0];
    }).join('');
  }
}

var Logger = function () {
  function Logger(X) {
    _classCallCheck(this, Logger);

    this.content = X || "";
  }

  _createClass(Logger, [{
    key: "print",
    value: function print() {
      for (var _len = arguments.length, s = Array(_len), _key = 0; _key < _len; _key++) {
        s[_key] = arguments[_key];
      }

      this.content += "," + (s || []).map(function (a) {
        return JSON.stringify(a);
      }).join(" ");return this;
    }
  }, {
    key: "println",
    value: function println() {
      for (var _len2 = arguments.length, s = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        s[_key2] = arguments[_key2];
      }

      this.print.apply(this, s);this.content += "\n";return this;
    }
  }, {
    key: "flush",
    value: function flush() {
      console.log(this.content);this.content = "";
    }
  }]);

  return Logger;
}();