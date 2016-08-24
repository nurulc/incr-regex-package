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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.assign = assign;
exports.copy = copy;
exports.extend = extend;
exports.ID = ID;
exports.flatten = flatten;
exports.array_eq = array_eq;
exports.arr_uniq = arr_uniq;
exports.arr_find = arr_find;
exports.array_match = array_match;
exports.array_append = array_append;
exports.sreverse = sreverse;
exports.sprefix = sprefix;
exports.rprefix = rprefix;
exports.shead = shead;
exports.stail = stail;
exports.sRightMerge = sRightMerge;
exports.parseMulti = parseMulti;
exports.odd = odd;
exports.arr_push = arr_push;
exports.n_cons = n_cons;
exports.n_head = n_head;
exports.n_tail = n_tail;
exports.n_reverse = n_reverse;
exports.arrayToList = arrayToList;
exports.stringToList = stringToList;
exports.listToArray = listToArray;
exports.listToString = listToString;
exports.n_concat = n_concat;
exports.n_map = n_map;
exports.n_filter = n_filter;
exports.n_find = n_find;
exports.n_reduce = n_reduce;
exports.n_removeAll = n_removeAll;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function assign(object) {
  if (!object) {
    return object;
  }
  for (var argsIndex = 1, argsLength = arguments.length; argsIndex < argsLength; argsIndex++) {
    var iterable = arguments[argsIndex];
    if (typeof iterable === 'function' || (typeof iterable === 'undefined' ? 'undefined' : _typeof(iterable)) === 'object' && iterable !== null) {
      var index = -1,
          keys = Object.keys(iterable),
          length = keys ? keys.length : 0,
          prop;
      while (++index < length) {
        prop = keys[index];
        object[prop] = iterable[prop];
      }
    }
  }
  return object;
}

function copy(obj) {
  return assign({}, obj);
}
function has(obj, key) {
  return !!obj[key];
}

function extend(protoProps, staticProps) {
  var Parent = this,
      Child;
  if (typeof Parent !== 'function') throw new Error('Parent must be a constructor function');

  if (has(protoProps, 'constructor')) {
    Child = protoProps.constructor;
  } else {
    Child = function Child() {
      return Parent.apply(this, arguments);
    };
  }

  assign(Child, Parent, staticProps);

  // subclass extends superclass
  Child.prototype = Object.create(Parent.prototype);
  if (protoProps) assign(Child.prototype, protoProps);

  Child.prototype.constructor = Child;
  //Child.__super__ = Parent.prototype;

  return Child;
}

var contract = exports.contract = function () {
  var call = Function.prototype.call;
  var slice = call.bind([].slice);
  var getClassName = call.bind({}.toString);

  // A contract that allows anything

  var isUndef = function isUndef(x) {
    return typeof x == 'undefined';
  };
  var NVL = function NVL(v, dflt) {
    return isUndef(v) ? dflt : v;
  };
  var any = function any(x) {
    return x;
  };
  var isClassOf = function isClassOf(s) {
    var TYPE = "[object " + s + "]";
    return function (v) {
      return getClassName(v) == TYPE;
    };
  };

  var classOf = function classOf(s) {
    var TYPE = "[object " + s + "]";
    return function (v) {
      if (getClassName(v) !== TYPE) {
        throw new TypeError("Expected " + s);
      }
      return v;
    };
  };

  var isArr = isClassOf("Array");

  // Manditory contract
  var arr = classOf("Array");

  var isTypeOf = function isTypeOf(s) {
    return function (v) {
      return (typeof v === 'undefined' ? 'undefined' : _typeof(v)) == s;
    };
  };

  // Creates a contract for a value of type s
  var typeOf = function typeOf(s) {
    return function (v) {
      if ((typeof v === 'undefined' ? 'undefined' : _typeof(v)) !== s) {
        throw new TypeError("Expected a" + (s === "object" ? "n" : "") + s + ".");
      }
      return v;
    };
  };

  //Manditory contract
  var func = typeOf("function");
  var isFunc = isTypeOf("function");

  // Creates a contract for an object inheriting from ctor
  var instanceOf = function instanceOf(ctor) {
    return function (inst) {
      if (!(inst instanceof ctor)) {
        throw new TypeError("Expected an instance of " + ctor);
      }
      return inst;
    };
  };

  var int32 = function int32(n) {
    if ((n | 0) !== n) {
      throw new TypeError("Expected a 32-bit natural.");
    }
    return n;
  };

  // Asserts int32 and nonnegative
  var nat32 = function nat32(n) {
    if ((n | 0) !== n || n < 0) {
      throw new TypeError("Expected a 32-bit natural.");
    }
    return n;
  };

  return {
    int32: int32, nat32: nat32,
    func: func, isFunc: isFunc,
    typeOf: typeOf, isTypeOf: isTypeOf,
    arr: arr, isArr: isArr,
    classOf: classOf, isClassOf: isClassOf,
    instanceOf: instanceOf,
    isUndef: isUndef
  };
}();

function ID(x) {
  return x;
}
function flatten(anArray) {
  var newArray = [];
  return newArray.concat.apply(newArray, anArray);
}

function array_eq(array, another) {
  // if the other array is a falsy value, return
  if (array === another) return true;
  if (!array || !another) return false;

  // compare lengths - can save a lot of time 
  if (another.length !== array.length) return false;

  for (var i = 0, l = another.length; i < l; i++) {
    // Check if we have nested arrays
    if (another[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!array_eq(array[i], another[i])) return false;
    } else if (another[i] !== array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
}

function arr_uniq(arr) {
  var seen = {};
  var arr2 = [];
  for (var i = 0; i < arr.length; i++) {
    if (!(arr[i] in seen)) {
      arr2.push(arr[i]);
      seen[arr[i]] = true;
    }
  }
  return arr2;
}

function arr_find(fn, arr) {
  for (var i = 0; i < arr.length; i++) {
    if (fn(arr[i])) {
      return arr[i];
    }
  }
  return undefined;
}

function array_match(array, subArray, at) {
  // if the other array is a falsy value, return
  if (!array || !subArray) return false;
  var len = array.length;
  var lenS = subArray.length;
  if (at + lenS > len) return false; // cannot match subArray too long 

  for (var i = at, l = lenS, j = 0; j < lenS; i++, j++) {
    // Check if we have nested arrays
    if (subArray[j] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!array_match(array[i], subArray[j], 0)) return false;
    } else if (array[i] !== subArray[j]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
}

function array_append(arr, list) {
  for (var i = 0; i < list.length; i++) {
    arr.push(list[i]);
  }return arr;
}

// Handy string utilities

function sreverse(s) {
  var o = [];
  for (var i = 0, len = s.length; i <= len; i++) {
    o.push(s.charAt(len - i));
  }return o.join('');
}

// Find the prefix of two strings,
//    s1 = prefix + rest_of_s1;
//    s2 = prefix + rest_of_s2
//    sprefix(s1,s2) === prefix
function sprefix(s1, s2) {
  var i = 0;
  for (; i < s1.length && i < s2.length; i++) {
    if (s1.charAt(i) !== s2.charAt(i)) return s1.substring(0, i);
  }
  return s1.length < s2.length ? s1 : s2;
}

// Find the postfix of two strings,
//    s1 = s1_start + post;
//    s2 = s2_start + post;
//    rprefix(s1,s2) === post
function rprefix(s1, s2) {
  return sreverse(sprefix(sreverse(s1), sreverse(s2)));
}

// s  = head + rest_of_s 
// n  = head.length
// shead(s,n) === head
function shead(s, n) {
  return s.length < n ? s : s.substr(0, n);
}

// s  = start_os_s + tail 
// n  = tail.length
// stail(s,n) === tail
function stail(s, n) {
  return s.length < n ? s : s.substr(s.length - n, n);
}

//  s1 = start_of_s1 + end
//  s2 = end + rest_of_s2
//  sRightMerge(s1,s2) === start_of_s1 + s2
// example s1 = "Jim hello", s2 = "hello how are you"
// sRightMerge(s1,s2) === "Jim hello how are you"
//  where: end is the longet string that satisfies the relationship above
function sRightMerge(s1, s2) {
  var n = Math.min(s1.length, s2.length);
  function match(s1, s2, n) {
    for (var i = s1.length - n, j = 0; j < n; i++, j++) {
      if (s1.charAt(i) !== s2.charAt(j)) return false;
    }return true;
  }
  for (var i = n; i > 0; i--) {
    if (match(s1, s2, i)) return s1.substr(0, s1.length - i) + s2;
  }
  return s1 + s2;
}

// Polyfill Object.assign
if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}

function rxtokensOld() {
  var t = "\\[(?:\\\\]|[^\\]]])*\\]";
  var meta = "[.\\]|)]|\\(\\?:|\\(|\\?\\?|\\?|\\*\\?|\\*|\\+\\?|\\+";
  var escaped = "\\\\(?:" + meta + "|" + "[dDsSbBwW\\[{}\\]])";
  var group = "\\{[0-9]+(?:,[0-9]*)?\\}";
  var nonMeta = "[^.+?{}\\]\\[|()]";
  return [/*unicode,*/t, group, escaped, meta, nonMeta].join("|");
}

/* REGEXP TOKENIZER HELPERS */
var TOKINIZATION_RX = exports.TOKINIZATION_RX = makeRegexp();
function rxtokens() {
  function ESACPE(s) {
    return s.split('').map(function (a) {
      return "\\" + a;
    }).join('|');
  }
  function OR(s) {
    return s.split('').join('|');
  }
  var charSet = '\\[(?:\\\\u|\\\\\\]|\\\\\\\\|(\\\\)?\\[|[^\\]\\[\\\\])*?\\]';
  //var meta = "[.\\]|)]|\\(\\?:|\\(|\\?\\?|\\?|\\*\\?|\\*|\\+\\?|\\+";
  var meta1 = ESACPE(".|+*?()^$");
  var meta2 = "\\(\\?:|\\?\\?|\\*\\?|\\+\\?";

  var escapeTarget1 = OR("dDsSbBwW");
  var escapeTarget2 = ESACPE("[]{}\\");
  var escapeTarget = [meta1, escapeTarget1, escapeTarget2].join('|');
  var escaped = "\\\\(?:" + escapeTarget + ")";

  var group = "\\{(?:\\d+,\\d+|\\d+|\\d+,|,\\d+)\\}";
  var nonMeta = "[^.+?{}\\]\\[|()\\\\]";
  return [charSet, group, escaped, meta2, meta1, nonMeta].map(function (a) {
    return "(?:" + a + ")";
  }).join("|");
}

//  
function makeRegexp() {
  return new RegExp(rxtokens(), "g");
}

function parseMulti(str) {
  var m = str.match(/\{(\d+)(,(\d*))?\}/); // handles { 3 }, { 4, }, {6, 9}
  var low = Number(m[1]);
  return { min: Number(m[1]), max: m[3] ? Number(m[3]) : m[2] ? undefined : low };
}

function odd(x) {
  return (+x & 1) > 0;
}

// push element into an array, or return the element
function arr_push(arr, elem) {
  if (arr === undefined) return elem;
  arr.push(elem);
  return arr;
}
// ===========================
// Stack/Array with no duplicates

var StackDedup = exports.StackDedup = function () {
  function StackDedup(v) {
    _classCallCheck(this, StackDedup);

    this.length = 0;
    this.data = [];
    v && this.push(v);
    this.maxLen = 0 | 0;
  }

  _createClass(StackDedup, [{
    key: 'forEach',
    value: function forEach(f) {
      var data = this.data;
      for (var i = 0; i < this.length; i++) {
        f(data[i], i, this);
      }
      return this;
    }
  }, {
    key: 'reduce',
    value: function reduce(f, iniV) {
      var data = this.data;
      for (var i = 0; i < this.length; i++) {
        iniV = f(iniV, data[i], i, this);
      }
      return iniV;
    }
  }, {
    key: 'filter',
    value: function filter(f) {
      var s = new StackDedup();
      var data = this.data;
      s.maxLen = this.maxLen;
      for (var i = 0; i < this.length; i++) {
        if (f(data[i], i, this)) s.push(data[i]);
      }
      return s;
    }
  }, {
    key: 'map',
    value: function map(f) {
      var s = new StackDedup();
      var data = this.data;
      s.maxLen = this.maxLen;
      for (var i = 0; i < this.length; i++) {
        s.push(f(data[i], i, this));
      }
      return s;
    }
  }, {
    key: 'toArray',
    value: function toArray() {
      return this.reduce(arr_push, []);
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.length = 0 | 0;
      this.maxLen = 0 | 0;
      return this;
    }
  }, {
    key: 'contains',
    value: function contains(v) {
      var data = this.data;
      var len = this.length;
      for (var i = 0; i < len; i++) {
        if (data[i] === v) {
          return this;
        }
      }
    }
  }, {
    key: 'push',
    value: function push(v) {
      if (v === undefined) return this;
      if (this.contains(v)) return this;
      this.data[this.length++] = v;
      if (this.length > this.maxLen) this.maxLen = this.length;
      return this;
    }
  }, {
    key: 'pop',
    value: function pop() {
      if (this.length <= 0) return this;
      length--;
      return this;
    }
  }, {
    key: 'top',
    value: function top() {
      if (this.length <= 0) return undefined;
      return data[this.length - 1];
    }
  }, {
    key: 'addAll',
    value: function addAll(list) {
      var _this = this;

      //console.log("ADD ALL",list);
      if (!list) return this;
      list.forEach(function (a) {
        return _this.push(a);
      });
      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return this.map(function (a) {
        return a;
      });
    }
  }]);

  return StackDedup;
}();

//============================================
// Immutable list implementation

var List_n = function () {
  function List_n(l, r) {
    _classCallCheck(this, List_n);

    this.head = l;
    this.tail = r;
  }

  _createClass(List_n, [{
    key: 'equals',
    value: function equals(b) {
      if (b === null) return false;
      return this.head === b.head && this.tail === b.tail;
    }
  }, {
    key: 'addAll',
    value: function addAll(aList) {
      if (!aList) return this;
      return n_reverse(a).reduce(function (rst, head) {
        return n_cons(head, rst);
      }, this);
    }
  }, {
    key: 'map',
    value: function map(f) {
      return n_map(f, this);
    }
  }, {
    key: 'reduce',
    value: function reduce(f, base) {
      return n_reduce(f, this, base);
    }
  }, {
    key: 'reverse',
    value: function reverse(base) {
      return n_reverse(this, base);
    }
  }]);

  return List_n;
}();

function n_cons(elem, list, base) {
  return new List_n(elem, list);
}

function n_head(list) {
  if (!list) throw Error("n_head of empty list");
  return list.head;
}

function n_tail(list) {
  if (!list) throw Error("n_tail of empty list");
  return list.tail;
}

/* note nl is optional */
function n_reverse(list) {
  var nl = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  //nl = nl || null;
  if (!list) return nl;
  return n_reverse(n_tail(list), n_cons(n_head(list), nl)); // simple tail recursion
}

function arrayToList(array) {
  return n_reverse(array.reduce(function (a, b) {
    return n_cons(b, a);
  }, null));
}

function stringToList(str) {
  return arrayToList(str.split(""));
}
function listToArray(list) {
  return n_reduce(function (a, b) {
    a.push(b);return a;
  }, list, []);
}
function listToString(list) {
  return listToArray(list).join('');
}

function n_concat(list1, list2) {
  if (!list1) return list2;
  return !list1 ? list2 : n_cons(n_head(list1), n_concat(n_tail(list1), list2));
}

function n_map(fn, list, i) {
  i = i || 0;
  return !list ? list : n_cons(fn(n_head(list), i, list), n_map(fn, n_tail(list), i + 1));
}

function n_filter(fn, list, i) {
  if (!list) return list;
  i = i || 0;
  if (fn(n_head(list), i, list)) return n_cons(n_head(list), n_filter(fn, n_tail(list), i + 1));
  return n_filter(fn, n_tail(list), i + 1);
}

function n_find(fn, list, i) {
  i = i || 0;
  if (!list) return null;
  return fn(n_head(list), i, list) ? list : n_find(fn, n_tail(list), i + 1);
}

function n_reduce(fn, list, base) {
  return !list ? base : n_reduce(fn, n_tail(list), fn(base, n_head(list))); // simple tail recursion
}

function n_removeAll(eq, list, listOfItemsToRemove) {
  if (arguments.length === 2) {
    listOfItemsToRemove = list;
    list = eq;
    eq = function eq(a, b) {
      return a === b;
    };
  }

  return n_filter(function (e) {
    return !n_find(function (a) {
      return eq(a, e);
    }, listOfItemsToRemove);
  }, list);
}

// stringToList, listToArray, listToString, n_cons, n_head, n_tail, n_filter, n_reduce, n_map, n_concat, n_removeAll