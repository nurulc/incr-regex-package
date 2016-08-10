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
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IREGEX = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

//import {OR,ZERO_OR_ONE,,ZERO_OR_MORE,ONE_OR_MORE,DOT,FALSE,DONE,MORE,MAYBE,FAILED} from './regexp-parser';


exports.incrRegEx = incrRegEx;
exports.convertMask = convertMask;
exports.isMeta = isMeta;
exports.isOptional = isOptional;
exports.isHolder = isHolder;
exports.__isDoneN = __isDoneN;

var _utils = require("./utils");

var _regexpParser = require("./regexp-parser");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
export function regexx(str,v) {
  return new RX(str, v);
}
*/

function incrRegEx(str, v) {
  return new IREGEX(str, v);
}

//========== CODE TO CHECK MINIMUM NUMBER of characters that must be input to finish the RegEx
//const HOLDER_ZERO_OR_MORE = '*';//"\u20e4" "\u2733" "\u2026";
//const HOLDER_ANY = '_';//"\u2581";
//const HOLDER_ZERO_OR_ONE = "?";//  "\u21a0"

var HOLDER_ZERO_OR_MORE = "⋯"; // "\u26b9"; //"\u20e4" ;
var HOLDER_ANY = "＿"; //"\u268a";//"\u05b7";//"\u035f"; ////"\u2581"; //"\u0332"; //"\u268a"; //
var HOLDER_ZERO_OR_ONE = "◑"; //"\u21a0";

/*
const HOLDER_ZERO_OR_MORE = "*";
const HOLDER_ANY = "_";
const HOLDER_ZERO_OR_ONE = "?"

*/

function convertMask(s) {
  var a = [];
  return s.split('').map(function (c) {
    return c === "*" ? HOLDER_ZERO_OR_MORE : c === "?" ? HOLDER_ZERO_OR_ONE : c === "_" ? HOLDER_ANY : c;
  }).join('');
}

function isMeta(ch) {
  return ch == HOLDER_ANY || isOptional(ch);
}

function isOptional(ch) {
  return ch == HOLDER_ZERO_OR_ONE || ch == HOLDER_ZERO_OR_MORE;
}

function isHolder(ch) {
  return ch === HOLDER_ANY;
}

function cleanMask(str) {
  var last = void 0; // undefined
  var list = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charAt(i);
    if (isOptional(c) && last === c) continue;
    last = c;
    list.push(c);
  }
  return list.join('');
}

function strip(s, notAllowed) {
  for (var i = 0; i < s.length; i++) {
    if (!notAllowed(s.charAt(i))) return s.substring(i + 1, s.length);
  }return s;
}

function rationalize(s1, s2) {
  var l = s1.length < s2.length ? s1.length : s2.length;
  var post = strip((0, _utils.rprefix)(s1, s2), isOptional);
  var res = '';
  var hasNull = false;
  var GET = 1;
  var SKIP = 2;
  var stream = function stream(str) {
    var ix = 0;
    return function (flag) {
      switch (flag) {
        case GET:
          return ix < str.length ? str.charAt(ix) : undefined;
        case SKIP:
          ix++;break;
        default:
          return ix < str.length;
      }
    };
  };

  var eq = function eq(a, b) {
    return a == b || isOptional(a) && isOptional(b);
  };
  var max = function max(a, b) {
    return a === HOLDER_ZERO_OR_MORE ? a : b;
  };
  var ss1 = stream(s1);
  var ss2 = stream(s2);
  for (; ss1() && ss2();) {
    var c1 = ss1(GET);
    var c2 = ss2(GET);
    var canbeNull = isOptional(c1) || isOptional(c2);
    //if( c1 === c2 && !canbeNull) res += c1;
    if (eq(c1, c2)) {
      res += max(c1, c2);ss1(SKIP);ss2(SKIP);
    } else if (!canbeNull) {
      res += HOLDER_ANY;ss1(SKIP);ss2(SKIP);
    } else if (isOptional(c1)) {
      res += c1;ss1(SKIP);
    } else {
      res += c2;ss2(SKIP);
    }
  }
  return (0, _utils.sRightMerge)(res, post);
}

// [or, p1,p2,p...]
// [dot, p1, p2, p...]
// [zero_or_one, p1]
// [zero_or_more, p1]
// function binary op form to n-arrya form
// [ op,  [op, x, y...], z] => [ op, x, y..., z] (applied recursively)
// [ op,  x, [op, y, z...]] => [ op, x, y, z...] (applied recursively)
function flattenRX(arr, code, res) {
  if (!Array.isArray(arr)) return (0, _utils.arr_push)(res, arr);

  var codex = arr[0];
  if (code !== codex) {
    var r = flattenRX(arr, codex, [codex]);
    return res ? (0, _utils.arr_push)(res, r) : r;
  }

  return arr.reduce(function (res, a) {
    return flattenRX(a, codex, res);
  });
}

function isLowerCase(ch) {
  var code = ch.charCodeAt(0);
  return code >= 97 && code <= 122;
}

function __isDone1N(el) {
  return el === _regexpParser.DONE;
}

function __isDoneN(res) {
  return res !== undefined && res.filter(function (el) {
    return el === _regexpParser.DONE;
  }).length === res.length;
}

//unit = [a]
//merge(a,b) = flatten([a,b]);
function makeRxInfo(unit, addElem, merge, optional, mapper) {
  var addOpt = function addOpt(rxNode, prefix) {
    if ((0, _regexpParser.zero_or_more)(rxNode)) return addElem(prefix, HOLDER_ZERO_OR_MORE);
    return prefix;
  };
  return getRxInfo;
  //--- returns the function below ---
  function getRxInfo(rxNode, prefix, optStop) {

    if (!rxNode) return unit(prefix);
    if (optStop && rxNode === (0, _utils.n_head)(optStop)) return getRxInfo(rxNode.nextNode, addOpt(rxNode, prefix), (0, _utils.n_tail)(optStop));

    if (rxNode === _regexpParser.DONE) return unit(prefix);
    if ((0, _regexpParser.dot)(rxNode)) {
      // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
      //console.log("getMaskListOLD-dot");
      return getRxInfo(rxNode.left, prefix, optStop);
    } else if ((0, _regexpParser.or)(rxNode)) {
      //  /A|B/ => or(A,B)
      //console.log("getMaskListOLD - or");
      var LL = getRxInfo(rxNode.left, prefix, optStop);
      var RL = getRxInfo(rxNode.right, prefix, optStop);
      return merge(LL, RL);
    } else if ((0, _regexpParser.zero_or_one)(rxNode)) {
      // /A?/  => zero_or_one(A)
      if (optional) {
        return optional(rxNode, prefix, getRxInfo, optStop);
      } else return getRxInfo(rxNode.nextNode, addElem(prefix, HOLDER_ZERO_OR_ONE), optStop);
    } else if ((0, _regexpParser.zero_or_more)(rxNode)) {
      //  / A* / => zero_or_more(A)       
      if (optional) {
        return optional(rxNode, prefix, getRxInfo, optStop);
      } else return getRxInfo(rxNode.nextNode, addElem(prefix, HOLDER_ZERO_OR_MORE), optStop);;
    } else if ((0, _regexpParser.matchable)(rxNode)) {
      var res = (0, _regexpParser.matchable)(rxNode)(undefined);
      var v = res[1] || (mapper ? mapper(rxNode, HOLDER_ANY) : HOLDER_ANY);
      //console.log("getMaskListOLD", v);
      return getRxInfo(rxNode.nextNode, addElem(prefix, v), optStop);
    } else if ((0, _regexpParser.boundary)(rxNode)) {
      return getRxInfo(rxNode.nextNode, prefix, optStop);
    }
    return unit(prefix);
  }
}

function makeArrayRxInfo(func, merge, base) {
  return getArrayRxInfo;

  function getArrayRxInfo(arr, prefix) {
    return arr.reduce(function (a, b) {
      return merge(a, func(b, prefix));
    }, base());
  }
}

function mapper(rxn, deflt) {
  if (!rxn) return deflt;
  switch (rxn.val) {
    case "[0-9]":
    case "\\d":
      return "9̲";
    case "[A-Za-z]":
    case "[a-zA-Z]":
    case "[a-z]":
      return "a̲";
    case "[A-Z]":
      return "A̲";
    case "[0-9A-Za-z]":
    case "[A-Z0-9a-z]":
    case "[A-Za-z0-9]":
    case "[0-9a-zA-Z]":
    case "[a-z0-9A-Z]":
    case "[a-zA-Z0-9]":
      return "z̲";
    default:
      return deflt;
  }
}

var arrayMaskListBuilder = function arrayMaskListBuilder(mapper, useopt) {
  var unit = function unit(a) {
    return a === undefined ? [] : [a];
  };
  var addElem = function addElem(a, b) {
    return a + b;
  };
  var merge = function merge(a, b) {
    return (0, _utils.flatten)([a, b]);
  };
  var aMerge = function aMerge(a, b) {
    return (0, _utils.flatten)((0, _utils.arr_push)(a, b));
  };
  var optfn = function optfn(rxn, prefix, getRxInfo, optStop) {
    if (rxn.left) {
      var ll = getRxInfo(rxn.nextNode, prefix, optStop);
      var rr = getRxInfo(rxn.left, prefix, (0, _utils.n_cons)(rxn, optStop));
      return merge(ll, rr);
    }
  };
  var optional = useopt ? optfn : undefined;;

  return makeArrayRxInfo(makeRxInfo(unit, addElem, merge, optional, mapper), aMerge, unit);
};

var getArrayMaskListFull = arrayMaskListBuilder(mapper, true);
var getArrayMaskList = arrayMaskListBuilder(mapper, false);

var getArrayMask = function () {
  var unit = function unit(a) {
    return a;
  };
  var addElem = function addElem(a, b) {
    return a + b;
  };
  var merge = function merge(a, b) {
    return rationalize(a, b);
  };
  var aMerge = function aMerge(a, b) {
    return rationalize(a || b, b);
  };
  var fn = makeArrayRxInfo(makeRxInfo(unit, addElem, merge), aMerge, unit);
  return function (rx) {
    return cleanMask(fn(rx, ''));
  };
}();

function fixedAt(rxNode) {

  if (!rxNode || rxNode === _regexpParser.DONE) return undefined;
  if ((0, _regexpParser.dot)(rxNode)) {
    // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
    return fixedAt(rxNode.left);
  } else if ((0, _regexpParser.matchable)(rxNode)) {
    var res = (0, _regexpParser.matchable)(rxNode)(undefined);
    return res[1]; // undefined if this is not a fixed character
  } else if ((0, _regexpParser.or)(rxNode)) {
      //  /A|B/ => or(A,B)
      var chL = fixedAt(rxNode.left);
      var chR = fixedAt(rxNode.right);
      return chL === chR ? chL : undefined; // only true if the same char begins bot portions of the OR ( left | right )
    } else if ((0, _regexpParser.zero_or_one)(rxNode) || (0, _regexpParser.zero_or_more)(rxNode) || (0, _regexpParser.boundary)(rxNode)) {
        return undefined;
      }

  return undefined;
}
function getArrayFixedAt(arr) {
  var c = arr && arr.length > 0 ? fixedAt(arr.data[0]) : undefined;
  if (c === undefined) return undefined;
  return arr.reduce(function (a, b) {
    return a === fixedAt(b) ? a : undefined;
  }, c);
}

function combine(a, b) {
  return a === -1 || b === -1 ? -1 : a + b;
}

function fixedSizePattern(rxNode) {
  if (!rxNode) return 0;

  if (rxNode === _regexpParser.DONE) return 0;
  if ((0, _regexpParser.dot)(rxNode)) {
    // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
    return combine(fixedSizePattern(rxNode.left), fixedSizePattern(rxNode.right));
  } else if ((0, _regexpParser.or)(rxNode)) {
    //  /A|B/ => or(A,B)
    var c = fixedSizePattern(rxNode.left);
    return c >= 0 && c === fixedSizePattern(rxNode.right) ? c : -1;
  } else if ((0, _regexpParser.zero_or_one)(rxNode) || (0, _regexpParser.zero_or_more)(rxNode)) return -1;else if ((0, _regexpParser.matchable)(rxNode)) {
    var res = (0, _regexpParser.matchable)(rxNode)(undefined);
    return res[1];
  } else if ((0, _regexpParser.boundary)(rxNode)) {
    return fixedSizePattern(rxNode.left);
  }
  return 0;
}

// New Regexp

var IREGEX = exports.IREGEX = function () {
  function IREGEX(str, v) {
    _classCallCheck(this, IREGEX);

    var len = 30;
    if (!str && !v) {
      this.str = "";
      this.base = undefined;
      this.tracker = undefined;
      this.current = undefined;
      this.one = this.current;
      this.two = undefined;
      this.lastCh = undefined;
      this.maxLen = 0;
      this._mask = undefined;
      //        this._lastEditableIndex = undefined;
      len = fixedSizePattern(this.base);
      if (len <= 0) len = 30;
      this._len = len;
    } else {
      if (!v && str) v = _regexpParser.RxParser.parse(str);
      //if( v ) v = makeFSM(v);
      this.str = str;
      this.base = v;
      this.tracker = [];
      this.current = new _utils.StackDedup(v);
      this.one = this.current;
      this.two = new _utils.StackDedup();
      this.lastCh = undefined;
      this.maxLen = 0;
      this.mask = undefined; // cached value (set this to undefined everytime we change the tracker)
      //        this._lastEditableIndex = undefined;  // cached value
      this._len = 30;
    }
  }

  _createClass(IREGEX, [{
    key: "toString",
    value: function toString() {
      return this.str;
    } /* public */

  }, {
    key: "getInputLength",
    value: function getInputLength() {
      return this.tracker.length;
    }
  }, {
    key: "isDone",
    value: function isDone(ix) {
      if (ix >= this.tracker.length || ix === undefined) {
        return this.state() === _regexpParser.DONE;
      }
      return false;
    }
  }, {
    key: "getTree",
    value: function getTree() {
      return this.base;
    } /* public */ // Get the parse tree from the regular expression

  }, {
    key: "minChars",
    value: function minChars() {
      /* public */ // get a ask for the regular expression from the current state of the match
      //if( this._mask ) return this._mask;
      this._mask = getArrayMask(this.current);
      return this._mask;
    }
  }, {
    key: "minCharsList",
    value: function minCharsList(flag) {
      var fn = flag ? getArrayMaskListFull : getArrayMaskList;
      //if( !flag ) throw new Error("flag should be true");
      return (0, _utils.arr_uniq)(fn(this.current, this.inputStr()));
    }
  }, {
    key: "match",
    value: function match(ch) {
      /* public */
      var fixed = getArrayFixedAt(this.current);

      var res = this.test(ch === HOLDER_ANY ? undefined : ch);
      if (res === undefined && ch && isLowerCase(ch)) {
        res = this.test(ch.toUpperCase());
        ch = ch.toUpperCase();
      }
      return this._update(res, ch, fixed);
    }
  }, {
    key: "matchStr",
    value: function matchStr(str) {
      /* public */
      var len = str.length;
      var b1 = true,
          b2 = 0,
          b3 = [];
      var i = 0;
      for (i = 0; i < len; i++) {
        var ch = str[i];
        if (!this.match(ch)) {
          b1 = false;break;
        }
        this.lastCh = ch;
        b2++;
      }
      return [b1, b2, str.substring(0, i)];
    }
  }, {
    key: "state",
    value: function state() {
      /* public */
      this._state = this._state || this._stateCompute();
      return this._state;
    }
  }, {
    key: "stateStr",
    value: function stateStr() {
      var s = this.state();
      if (s === _regexpParser.MORE) return "MORE"; // match is not complete but good so far
      if (s === _regexpParser.MAYBE) return "OK"; // match is complete but could have more
      return "DONE";
    }
  }, {
    key: "inputStr",
    value: function inputStr() {
      return this.tracker.map(function (a) {
        return a[0];
      }).join('');
    }
  }, {
    key: "fixed",
    value: function fixed() {
      return getArrayFixedAt(this.current);
    }
  }, {
    key: "reset",
    value: function reset() {
      /* public */
      this.tracker = [];
      this.current.reset();
      this.current.push(this.base);
      this.lastCh = undefined;
      this._state = undefined;
      this._mask = undefined;
      return this;
    }
  }, {
    key: "clone",
    value: function clone() {
      /* public */
      var t = incrRegEx();
      t.str = this.str;
      t.base = this.base;
      t.tracker = this.tracker.slice(0); // copy
      t.one = this.one.map(_utils.ID);
      t.two = this.two.map(_utils.ID);
      t.current = this.current == this.one ? t.one : t.two;
      t.lastCh = this.lastCh;
      t._state = this._state;
      t._mask = undefined;
      t._len = this.length;

      return t;
    }
  }, {
    key: "getInputTracker",
    value: function getInputTracker() {
      return this.tracker.map(_utils.ID);
    }

    // Private methods

  }, {
    key: "_after",
    value: function _after(all, ix) {
      /* public */ // get the input matched so far after ix.
      if (!ix) {
        var al = all ? this.tracker : this.tracker.filter(function (e) {
          return e[1] === undefined;
        });
        return al.map(function (e) {
          return e[0];
        }).join('');
      } else {
        var _al = this.tracker.filter(function (e, i) {
          return i >= ix && (all || e[1] === undefined);
        });
        return _al.map(function (e) {
          return e[0];
        }).join('');
      }
    }
  }, {
    key: "_getArr",
    value: function _getArr() {
      if (this.current === this.one) return this.two.reset();
      return this.one.reset();
    }
  }, {
    key: "action",
    value: function action(e, ch, newStack, ignoreBoundary) {
      if (e === _regexpParser.DONE) {
        if (ch === _regexpParser.DONE) {
          newStack.push(_regexpParser.DONE);
          return _regexpParser.DONE;
        }
        return _regexpParser.FAILED;
      } else if ((0, _regexpParser.dot)(e)) {
        return this.action(e.left, ch, newStack, ignoreBoundary);
      } else if ((0, _regexpParser.or)(e)) {
        var rl = this.action(e.left, ch, newStack, ignoreBoundary);
        var rr = this.action(e.right, ch, newStack, ignoreBoundary);
        return this._result(rl, rr);
      } else if ((0, _regexpParser.zero_or_one)(e) || (0, _regexpParser.zero_or_more)(e)) {
        var _rl = (0, _regexpParser.boundary)(e.left) ? _regexpParser.DONE : this.action(e.left, ch, newStack, true);
        var _rr = this.action(e.nextNode, ch, newStack, ignoreBoundary);
        return this._result(_rl, _rr);
      } else if ((0, _regexpParser.matchable)(e)) {
        var res = e.match(ch);
        if (res[0]) {
          newStack.push(e.nextNode);
        }
        return res[0] ? e.nextNode === _regexpParser.DONE ? _regexpParser.DONE : _regexpParser.MORE : _regexpParser.FAILED;
      } else if ((0, _regexpParser.boundary)(e)) {
        if (ignoreBoundary) return _regexpParser.FAILED;
        var _res = e.match(this.lastCh, ch);
        if (_res[0]) {
          e = e.nextNode;
          _res = this.action(e, ch, newStack);
          return _res;
        }
        return _regexpParser.FAILED;
      }
      return _regexpParser.FAILED;
    }
  }, {
    key: "_result",
    value: function _result(l, r) {
      if (l === r) return l;
      if (l === _regexpParser.MORE || r === _regexpParser.MORE) return _regexpParser.MORE;
    }
  }, {
    key: "test",
    value: function test(ch, curr) {
      var _this = this;

      curr = curr || this.current;
      var res = _regexpParser.FAILED;
      var next = this._getArr();
      curr.forEach(function (e) {
        res = _this._result(_this.action(e, ch, next), res);
      });
      if (res === _regexpParser.FAILED || next.length === 0) {
        return undefined;
      }
      //console.log("TEST: ",next);
      return next;
    }
  }, {
    key: "_update",
    value: function _update(res, ch, fixed) {
      if (res !== undefined) {
        this.tracker.push([ch === undefined ? HOLDER_ANY : ch, fixed]);
        if (res.maxLen > this.maxLen) this.maxLen = res.maxLen;
        this.current = res;
        this.lastCh = ch;
        this._state = undefined;
        this._mask = undefined;
        //            this._lastEditableIndex = undefined;
      }
      return res !== undefined;
    }
  }, {
    key: "_stateCompute",
    value: function _stateCompute() {
      //console.log("Compute State");
      var res = this.test(undefined);
      if (res === undefined) return _regexpParser.DONE;
      var isdone = this.test(_regexpParser.DONE);
      //console.log("isDone", !!isdone);
      if (__isDoneN(isdone)) return _regexpParser.MAYBE;
      return _regexpParser.MORE;
    }
  }, {
    key: "length",
    get: function get() {
      return this._len;
    }
  }]);

  return IREGEX;
}();