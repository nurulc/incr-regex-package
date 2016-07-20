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

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RxMatcher = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("./utils");

var _incrRegexV = require("./incr-regex-v3");

var _regexpParser = require("./regexp-parser");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RxMatcher = exports.RxMatcher = function () {
  function RxMatcher(matcher) {
    _classCallCheck(this, RxMatcher);

    this.matcher = matcher;
    this._lastEditableIndex = undefined;
    this._tracker;
  }

  _createClass(RxMatcher, [{
    key: "getFirstEditableAtOrAfter",
    value: function getFirstEditableAtOrAfter(ix) {
      var i = ix;
      var tracker = this.getInputTracker();
      for (; i < tracker.length; i++) {
        //  if(isMeta(tracker[i][1])) return i;
        if (tracker[i][1] === undefined) return i;
      }var m = this.minChars();
      i = tracker.length;
      var j = 0;
      //if( m.length > 0 && isOptional(m.charAt(j))) j++;
      for (; j < m.length && (i < ix || !(0, _incrRegexV.isMeta)(m.charAt(j))); j++, i++) {}
      return i;
    }
  }, {
    key: "getFirstEditableAtOrBefore",
    value: function getFirstEditableAtOrBefore(ix) {
      var tracker = this.getInputTracker();
      if (ix >= tracker.length) ix = tracker.length - 1;
      for (; ix > 0; ix--) {
        if (tracker[ix][1] === undefined) return ix;
      }return 0;
    }
  }, {
    key: "getInputLength",
    value: function getInputLength() {
      return this.matcher.getInputLength();
    }
  }, {
    key: "setPos",
    value: function setPos(ix) {
      //let currTracker = this.tracker.slice(0); // copy the array
      if (ix !== undefined) {
        var tracker = this.getInputTracker();
        var s = tracker.map(function (s) {
          return s[0];
        }).join('').substr(0, ix);
        this.reset();
        this.matchStr(s);
        tracker = this.getInputTracker(); // have to do this since we did some matching
        for (; tracker.length < ix && this.fixed() !== undefined;) {
          if (!this.match(this.fixed())) {
            ix = this.getInputLength();
            break;
          }
        } //this._mask = undefined;
        this._resetCache();
      }
      return ix;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.matcher.toString();
    } /* public */

  }, {
    key: "after",
    value: function after(ix) {
      return this.matcher._after(true, ix);
    }
  }, {
    key: "valueWithMask",
    value: function valueWithMask() {
      return this.matcher.valueWithMask();
    }
  }, {
    key: "rawValue",
    value: function rawValue(ix) {
      return this.matcher.rawValue(ix);
    }
  }, {
    key: "_after",
    value: function _after(flag, ix) {
      return this.matcher._after(flag, ix);
    }
  }, {
    key: "isDone",
    value: function isDone(ix) {
      return this.matcher.isDone(ix);
    }
  }, {
    key: "setToFirstEditableAfter",
    value: function setToFirstEditableAfter(ix) {
      if (ix === undefined) ix = this.getInputLength();
      return this.setPos(this.getFirstEditableAtOrAfter(ix));
    }
  }, {
    key: "lastEditableIndex",
    value: function lastEditableIndex() {
      if (this._lastEditableIndex === undefined) {
        var tracker = this.getInputTracker();
        var rx = this.clone();
        var ix = this.getFirstEditableAtOrAfter(tracker.length);
        rx.setPos(ix);
        if (rx.state() === _regexpParser.DONE) ix = tracker.length;
        this._lastEditableIndex = ix;
      }
      return this._lastEditableIndex;
    }
  }, {
    key: "getTree",
    value: function getTree() {
      return this.matcher.getTree();
    } /* public */ // Get the parse tree from the regular expression

  }, {
    key: "minChars",
    value: function minChars(ix) {
      /* public */ // get a ask for the regular expression from the current state of the match
      if (ix === undefined) return this.matcher.minChars();
      var p = this.matcher.clone();
      var s = this.matcher._after(true, 0).substring(0, ix);
      p.reset();
      var ret = p.matchStr(s);
      console.log("ix: ", ix, " str: '", s, "'");
      if (!ret[0]) {
        throw new Error("Unexpected error (matchStr failed) from " + p.constructor.name || "IREGEX");
      }
      return p.minChars();
    }
  }, {
    key: "emptyAt",
    value: function emptyAt(ix) {
      var tracker = this.getInputTracker();
      if (ix < tracker.length) return (0, _incrRegexV.isHolder)(tracker[ix][0]);
      return false;
    }
  }, {
    key: "match",
    value: function match(ch) {
      /* public */
      this._resetCache();
      return this.matcher.match(ch);
    }
  }, {
    key: "matchStr",
    value: function matchStr(str) {
      /* public */
      this._resetCache();
      return this.matcher.matchStr(str);
    }
  }, {
    key: "state",
    value: function state() {
      /* public */
      return this.matcher.state();
    }
  }, {
    key: "fixed",
    value: function fixed() {
      return this.matcher.fixed();
    }
  }, {
    key: "reset",
    value: function reset() {
      /* public */
      this.matcher.reset();
      return this;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new RxMatcher(this.matcher.clone());
    }
  }, {
    key: "getInputTracker",
    value: function getInputTracker() {
      //if( this._tracker === undefined )
      this._tracker = this.matcher.tracker; //this.matcher.getInputTracker(); 
      return this._tracker;
    }
  }, {
    key: "getFullTracker",
    value: function getFullTracker() {
      var t = this.getInputTracker();
      var rest = this.matcher.minChars().map(function (c) {
        return (0, _incrRegexV.isMeta)(c) ? [c, undefined] : [c, c];
      });
      return append(t, rest);
    }
  }, {
    key: "_resetCache",
    value: function _resetCache() {
      this._tracker = undefined;
      this._lastEditableIndex = undefined;
    }
  }, {
    key: "length",
    get: function get() {
      return this.matcher.length;
    }
  }]);

  return RxMatcher;
}();