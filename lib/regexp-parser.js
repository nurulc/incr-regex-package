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
exports.RxParser = exports.RXTREE = exports.FAILED = exports.MAYBE = exports.MORE = exports.DONE = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.MANY = MANY;
exports.TERM = TERM;
exports.PERHAPS_MORE = PERHAPS_MORE;
exports.BOUNDARY = BOUNDARY;
exports.makeFSM = makeFSM;
exports.matchable = matchable;
exports.boundary = boundary;
exports.dot = dot;
exports.or = or;
exports.zero_or_one = zero_or_one;
exports.zero_or_more = zero_or_more;
exports.anychar = anychar;
exports.charset = charset;
exports.copyNode = copyNode;
exports.clearNodeMarkers = clearNodeMarkers;
exports.printExpr = printExpr;
exports.printExprN = printExprN;

var _utils = require("./utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function MANY() {}
function TERM() {}
function PERHAPS_MORE() {}
function BOUNDARY() {}

if (!_utils.array_append) {
  throw new Error("array_append is undefined");
}

function isMulti(op) {
  return op && op.type == 'U' && op.op == 'MULTIRANGE';
}

// Matching function
// =================
function __matchX(regexp) {
  return function (ch) {
    return [ch !== DONE && (ch === undefined || ch.match(regexp)), undefined];
  };
}

function anychX(ch) {
  return [ch !== DONE, undefined];
}
function __matchcX(c) {
  return function (ch) {
    return [ch !== DONE && (ch === undefined || ch == c), c];
  };
}

function __match(regexp) {
  return function (ch) {
    return [!!(ch !== DONE && (ch === undefined || ch.match(regexp))), undefined];
  };
}

function anych(ch) {
  return [ch !== DONE, undefined];
}
function __matchc(c) {
  return function (ch) {
    return [!!(ch !== DONE && (ch === undefined || ch === c)), c];
  };
}

function isNotAlnum(ch) {
  return (/[^a-zA-Z0-9]/.test(ch || '.')
  );
}
function endofstr(prev, ch) {
  var l = isNotAlnum(prev);
  var r = isNotAlnum(ch);
  return [l && !r || !l && r, undefined];
}

//==========================
/*

Convert a RegExp parse tree to a finite state machine (FSM)

  so given a subtree 't' and a connector (next state)
  set the 'nextNode' to the connector

cases of t:
    t - simple match =>  t.nextNode = connector  (shortened to t -> connector )
      - A . B        =>  A -> B -> connector
      - A*           =>  A -> t -> connector
      - A | B        =>  A -> connector, B -> connector
      - A ?          =>  t -> connector, A -> connector
*/

function makeFSM(t, connector) {
  if ((matchable(t) || boundary(t)) && connector) {
    // t => t->connector
    t.nextNode = connector;
    return t;
  } else if (dot(t)) {
    //( . l r) => l->r->connector
    var right = connector ? makeFSM(t.right, connector) : t.right;
    makeFSM(t.left, right);
    return t;
  } else if (or(t) && connector) {
    // ( | l r) => ( | l->connector  r->connector)
    if (t.left === SKIP) t.left = connector;else makeFSM(t.left, connector);
    if (t.right === SKIP) t.right = connector;else makeFSM(t.right, connector);
    return t;
  } else if (zero_or_one(t) && connector) {
    // ( ? l) => (? l->connector)->connector
    makeFSM(t.left, connector);
    t.nextNode = connector;
    return t;
  } else if (zero_or_more(t) && connector) {
    // ( * l) => (? l->self)->connector
    var self = t;
    makeFSM(t.left, self);
    t.nextNode = connector;
    return t;
  }
  return t;
}

function OP(x, msg) {
  var toStr = function toStr() {
    return msg || x.val;
  };
  x.toString = toStr;
  return x;
}

var SKIP = OP({ type: 'N', val: "<SKIP>", multi: TERM, op: 'SKIP', match: anych });
var BS = OP({ type: 'N', val: "\b", multi: TERM, op: 'SINGLE', match: __match(/[\b]/) });
var LP = OP({ type: 'L', val: ')' });
var RP = OP({ type: 'R', val: ')' });
var OR = OP({ type: 'B', val: '|', op: 'OR' });
var ZERO_OR_ONE = OP({ type: 'U', val: "?", op: 'MULTI' });
var ZERO_OR_MORE = OP({ type: 'U', val: "*", op: 'MULTI' });
var ONE_OR_MORE = OP({ type: 'U', val: "+", op: 'MULTI' });
var DOT = OP({ type: 'B', val: '.', op: '.' });
var FALSE = function FALSE() {
  return false;
};

var DONE = exports.DONE = OP({ type: 'N', val: "DONE", multi: BOUNDARY, op: 'DONE', match: FALSE }); // cannot match any more
var MORE = exports.MORE = OP({ type: 'N', val: "MORE", multi: BOUNDARY, op: 'MORE', match: FALSE }); // regex not yet done, more to match
var MAYBE = exports.MAYBE = OP({ type: 'N', val: "MAYBE", multi: BOUNDARY, op: 'MAYBE', match: FALSE }); // done, but could match more
var FAILED = exports.FAILED = OP({ type: 'N', val: "FAILED", multi: BOUNDARY, op: 'FAILED', match: FALSE }); // (should never be here) the pattern does not match

function matchable(node) {
  return node && !node.oper && node.multi !== BOUNDARY && node.match;
} // return the matcher function or false
function boundary(node) {
  return node && !node.oper && node.multi === BOUNDARY && node.match;
} // return the matcher function or false
function dot(exp) {
  return exp && exp.oper === DOT;
}
function or(exp) {
  return exp && exp.oper === OR;
}
function zero_or_one(exp) {
  return exp && exp.oper === ZERO_OR_ONE;
}
function zero_or_more(exp) {
  return exp && exp.oper === ZERO_OR_MORE;
}
function anychar(exp) {
  return exp && exp.type === 'N' && exp.op === 'ANY';
}
function charset(exp) {
  return exp && exp.type === 'N' && (exp.op === 'CHARSET' || exp.op === 'SPECIAL-CHARSET');
}

var RXTREE = exports.RXTREE = { matchable: matchable, boundary: boundary, dot: dot, or: or, zero_or_one: zero_or_one, zero_or_more: zero_or_more,
  OR: OR, ZERO_OR_ONE: ZERO_OR_ONE, ZERO_OR_MORE: ZERO_OR_MORE, ONE_OR_MORE: ONE_OR_MORE, DOT: DOT, FALSE: FALSE };

//matchable,dot,or,zero_or_one,zero_or_more

var _metaMap = { "*": ZERO_OR_MORE, "+": ONE_OR_MORE, "?": ZERO_OR_ONE };
var _stdRegexp = { "\\d": /\d/, "\\D": /\D/, "\\s": /\s/, "\\S": /\S/, "\\w": /\w/, "\\W": /\W/ };
var chmap = { 't': "\t", 'n': "\n", 'r': "\r" };

function convert(str) {
  if (str == '<SKIP>') return SKIP;
  if (str == '(' || str == '(?:') return LP;
  if (str == ')') return RP;
  if (str == '.') return { type: 'N', val: "(.)", multi: MANY, op: 'ANY', match: anych };
  if (str == '[\\b]') return { type: 'N', val: "\b", multi: TERM, op: 'SINGLE', match: __match(/[\b]/) };
  if (str == '^' || str == '$') return { type: 'N', val: str, multi: BOUNDARY, op: 'BOUNDARY', match: begining };
  if (str == '\\b' || str == '\\B') return { type: 'N', val: str, multi: BOUNDARY, op: 'BOUNDARY', match: endofstr };
  if (/^\[.*\]$/.test(str)) return { type: 'N', val: str, multi: MANY, op: 'CHARSET', match: __match(new RegExp(str)) };
  if (str == '|') return OR;
  if (/^[?+*]\??$/.test(str)) return _metaMap[str.substring(0, 1)];
  if (/^\{[^}]*\}$/.test(str)) return { type: 'U', val: str, op: 'MULTIRANGE', fn: (0, _utils.parseMulti)(str) };
  if (/^\\[dDsSwW]$/.test(str)) return { type: 'N', val: str, multi: MANY, op: 'SPECIAL-CHARSET', match: __match(_stdRegexp[str]) };
  if (/^\\[trn]$/.test(str)) return { type: 'N', val: chmap[str.substring(1, 2)], multi: TERM, op: 'NON-PRINTING', match: __match("\\" + str.substring(1)) };
  if (/^\\[.?+*{}()$^\\:]$/.test(str)) return { type: 'N', val: str.substring(1, 2), multi: TERM, op: 'SINGLE', match: __matchc(str.substring(1)) };
  return { type: 'N', val: str, multi: TERM, op: 'SINGLE', match: __matchc(str) };
}

function copyNode(aNode) {
  if (aNode === undefined) return undefined;
  if (aNode === DONE) return DONE;
  //if( aNode.type === 'U' ) return {type: 'U', val: aNode.val, op: aNode.op, match: aNode.match};
  if (aNode.type === 'N' && aNode.oper === undefined) return { type: 'N', val: aNode.val, multi: aNode.multi, op: aNode.op, match: aNode.match };
  if (aNode.left && (dot(aNode) || zero_or_one(aNode) || zero_or_more(aNode) || or(aNode))) {
    if (aNode.right) return { oper: aNode.oper, left: copyNode(aNode.left), right: copyNode(aNode.right) };else return { oper: aNode.oper, left: copyNode(aNode.left) };
  }
  throw new Error("Copy of an invalid node " + aNode);
}

function clearNodeMarkers(aNode) {
  if (aNode === undefined) return undefined;
  if (aNode === DONE) {
    DONE.marker = 0;return DONE;
  }
  //if( aNode.type === 'U' ) return {type: 'U', val: aNode.val, op: aNode.op, match: aNode.match};
  if (aNode.type === 'N' && aNode.oper === undefined) {
    aNode.marker = 0;
  } else {
    clearNodeMarkers(aNode.right);
    clearNodeMarkers(aNode.left);
  }
  aNode.marker = 0;
}

function RX_OP(op, a, b) {
  if (op === DOT) return RX_CONS(a, b);
  if (op === OR) return RX_OR(a, b);
  return !b ? a : { oper: op, left: a, right: b };
}
function RX_CONS(a, b) {
  if (a === SKIP) return b;
  if (b === SKIP) return a;
  return !b ? a : { oper: DOT, left: a, right: b };
}
function RX_OR(a, b) {
  return !b ? a : { oper: OR, left: a, right: b };
}
function RX_ZERO_OR_MORE(a) {
  return { oper: ZERO_OR_MORE, left: a };
}
function RX_ONE_OR_MORE(a) {
  return RX_CONS(a, RX_ZERO_OR_MORE(copyNode(a)));
}

// =============
// Parser helpers
//
// Helper function for Precedence

// odd values are left associative and even value aare right associative
// e.g.   '.' opererator
//     a . b . c =>  a . (b . c)   RIGHT ASSOCIATIVE
//     a . b . c => (a . b) . c    LEFT  ASSOCIATIVE
//
// for the efficient evaluation of regular expressions
// right associative is more efficient to evaluate
//
// Note the unary operators ( ? * + ) must be left associative
//
//    a+*   =>  (a+)*
//
// a is higher precedence true
// a == b
function gtPrec(a, b) {
  if (a < b) return false;
  if (a > b) return true;
  return (0, _utils.odd)(a);
}

var mapper = [{ match: ["(", "|", ")"], put: ["(", ")"] }, { match: ["<SKIP>", "|", "<SKIP>"], put: ["<SKIP>"] }, { match: ["<SKIP>", "<SKIP>"], put: ["<SKIP>"] }, { match: ["(", "<SKIP>", ")"], put: ["<SKIP>"] }, { match: ["<SKIP>", "*"], put: ["<SKIP>"] }, { match: ["<SKIP>", "+"], put: ["<SKIP>"] }, { match: ["(", "|"], put: ["(", "<SKIP>", "|"] }, { match: ["|", ")"], put: ["|", "<SKIP>", ")"] }, { match: ["|", "|"], put: ["|", "<SKIP>", "|"] }, { match: ["(", ")"], put: ["<SKIP>"] }];

// Match an item in the mapper table against the tokenList at position ix
// Note = is the mathematical concept of equality and not an assignment
//
// let m = mapper[i].match ; // for some i
// let tokenList = prefixArray + m + rest ; // + means array concatination
// let ix = prefixArray.length;
// then
//    matchMapper(tokenList,ix) = m
function matchMapper(tokenList, ix) {
  for (var i = 0; i < mapper.length; i++) {
    if ((0, _utils.array_match)(tokenList, mapper[i].match, ix)) return mapper[i];
  }
  return undefined;
}

// Note = is the mathematical concept of equality and not an assignment
// if no 'i' exists where matchMapper(tokebList,i) has a value
//  then udateTokens(list) = list
//  else
//    for smallest ix
//    let map = matchMapper(pre + m + post,ix)
//    then
//       updateTokens(pre + m + post) = pre + map + updateTokens(post)
function updateTokens(tokenList) {
  var res = [];
  for (var i = 0, l = tokenList.length; i < l; i++) {
    var mapV = matchMapper(tokenList, i);
    if (mapV) {
      (0, _utils.array_append)(res, mapV.put);
      i += mapV.match.length - 1;
    } else res.push(tokenList[i]);
  }
  return res;
}

/*
  Simple operator precedence grammar has problems with some accepable regular expression 

  examples:
     /|abc.../    - expression cannot start wiht a binary operator, change to /<SKIP>|abc.../
     /...(|)...)- expression cannot start wiht a binary operator, change to /...<SKIP>.../
     /...(|abc...)- expression cannot start wiht a binary operator, change to /...(<SKIP>|abc.../
     /...(xyz||abc...)- expression cannot start wiht a binary operator, change to /...(xyz|<SKIP>|abc.../
     /...abc|)...)- expression cannot start wiht a binary operator, change to /...abc|<SKIP>).../
     /...()...)- expression cannot start wiht a binary operator, change to /...<SKIP>.../
     /...(<SKIP>)...)- expression cannot start wiht a binary operator, change to /...<SKIP>.../
     /...<SKIP>*...)- expression cannot start wiht a binary operator, change to /...<SKIP>.../
     /...<SKIP>+...)- expression cannot start wiht a binary operator, change to /...<SKIP>.../
     /...<SKIP><SKIP>...)- expression cannot start wiht a binary operator, change to /...<SKIP>.../



*/
function fixTokens(tokenList) {
  if (tokenList) {
    if (tokenList[tokenList.length - 1] == "|") tokenList = tokenList.concat("<SKIP>");
    if (tokenList[0] == "|") tokenList = ["<SKIP>"].concat(tokenList);
  }
  var newList = updateTokens(tokenList);
  while (!(0, _utils.array_eq)(tokenList, newList)) {
    tokenList = newList;
    newList = updateTokens(tokenList);
  }
  return tokenList;
}
function isRegExp(s) {
  return s instanceof RegExp;
}

// Actual parser
/*

 This is a parser for regular expressions, it uses a simple operator precidence parser
 It uses a regular expression as the tokenizer (TOKINIZATION_RX)


*/

var RxParser = exports.RxParser = function () {
  function RxParser() {
    _classCallCheck(this, RxParser);

    this.operand = [];
    this.operator = [];
    this.basePrec = 0;
    this.wasOp = true;
    this.lastop = undefined;
  }

  _createClass(RxParser, [{
    key: "toString",
    value: function toString() {
      return "{ operand: " + this.operand.map(printExpr) + " operator: " + this.operator.map(function (e) {
        return e.toString();
      }) + " prec: " + this.BasePrec + " wasOp: " + this.wasOp + "}";
    }
  }, {
    key: "opState",
    value: function opState(from, to, op) {
      var tp = function tp(x) {
        return x ? "OPERATOR" : "OPERAND";
      };
      this.lastop = op;
      if (this.wasOp != from) {
        throw new Error("RegExp parsing expected: " + tp(from) + " but was: " + tp(this.wasOp));
      }
      this.wasOp = to;
    }
  }, {
    key: "addToken",
    value: function addToken(a) {
      if (!a) return this.finishUp();

      var c = convert(a); //console.log(c);
      if ((c.type == 'N' || c.type == 'L') && !this.wasOp) {
        this.pushOp(DOT, this.basePrec + 4);
        this.opState(false, true);
      }
      switch (c.type) {
        case 'L':
          this.opState(true, true, LP);this.basePrec += 10;break;
        case 'R':
          this.opState(false, false, RP);this.basePrec -= 10;
          if (this.basePrec < 0) throw Error("Syntax error " + this.basePrec);break;
        case '':
        case 'B':
          this.pushOp(c, this.basePrec + 2);
          this.opState(false, true, c);
          break;
        case 'U':
          this.pushOp(c, this.basePrec + 7);this.opState(false, false, c);break;
        case 'N':
          this.operand.push(c);this.opState(true, false, c);break;
        default:
          throw Error("Syntax error");
      }
      return this;
    }
  }, {
    key: "pushOp",
    value: function pushOp(op, prec) {
      var t = this.topV() || { prec: -100 };
      //console.log("top",prec, op, t);
      while (t && gtPrec(t.prec, prec)) {
        var a, b;

        b = this.popOper();
        if (!t.op.type || t.op.type == 'B') {
          a = this.popOper(); //console.log("pushOp",{ op: t.op, left: a, right: b });
          this.operand.push(RX_OP(t.op, a, b));
        } else {
          if (isMulti(t.op)) {
            this.operand.push(this.applyMulti(t.op, b));
          } else if (t.op === ONE_OR_MORE /*t.op.val == "+" */) {
              this.oneOrMore(b); //this.operand.push({oper: DOT, left: b, right:{ oper: ZERO_OR_MORE, left: b}});
            } else {
              this.unaryOp(t.op, b);
            } //this.operand.push({ oper: t.op, left: b}); }
          //console.log("pushOp",{ oper: t.op, left: a, right: b });
        }

        this.operator.pop();
        t = this.topV();
      }
      if (prec >= 0) this.operator.push({ op: op, prec: prec });
    }
  }, {
    key: "finishUp",
    value: function finishUp() {
      if (this.wasOp === undefined) return this;
      if (!this.wasOp) {
        this.pushOp(DOT, 0);
        this.operand.push(DONE);
        this.pushOp(undefined, -1);
      } else this.pushOp(undefined, -1);
      this.wasOp = undefined;
      return this;
    }
  }, {
    key: "val",
    value: function val() {
      return this.operand.length === 0 ? undefined : this.operand[this.operand.length - 1];
    }
  }, {
    key: "topV",
    value: function topV() {
      return this.operator.length === 0 ? undefined : this.operator[this.operator.length - 1];
    }
  }, {
    key: "popOper",
    value: function popOper() {
      return this.operand.pop();
    }
  }, {
    key: "applyMulti",
    value: function applyMulti(op, b) {
      var min = op.fn.min;
      var max = op.fn.max;
      var i;
      if (boundary(b)) throw new SyntaxError("repetition of boundary element: " + expr.val + " has no meaning");
      var applyIt = function applyIt(p, b, max) {
        if (max === 0) return p;
        for (i = 0; i < max; i++) {
          b = copyNode(b);
          p = p ? RX_CONS(p, b) : b;
        }
        return p || b;
      };
      // 0 or more
      if (min === 0) {
        if (max === undefined) return { oper: ZERO_OR_MORE, left: b };else return applyIt(undefined, { oper: ZERO_OR_ONE, left: b }, max);
      } else if (max === undefined) {
        // 1 or more
        return applyIt(applyIt(undefined, b, min), { oper: ZERO_OR_MORE, left: b }, 1);
      }

      // min and max are present
      return applyIt(applyIt(b, b, min - 1), { oper: ZERO_OR_ONE, left: copyNode(b) }, max - min);
    }
  }, {
    key: "oneOrMore",
    value: function oneOrMore(expr) {
      if (boundary(expr)) throw new SyntaxError("repetition of boundary element: " + expr.val + " has no meaning");
      //this.operand.push({oper: DOT, left: expr, right:{ oper: ZERO_OR_MORE, left: expr}});
      this.operand.push(RX_CONS(expr, RX_ZERO_OR_MORE(copyNode(expr))));
    }
  }, {
    key: "unaryOp",
    value: function unaryOp(op, expr) {
      if (boundary(expr)) throw new SyntaxError("modifier (" + op.val + ") of boundary element: " + expr.val + " has no meaning");
      this.operand.push({ oper: op, left: expr });
    }
  }], [{
    key: "parse",
    value: function parse(str) {
      //console.log("str", str instanceof RegExp, isRegExp(str), RegExp);
      if (typeof str != 'string') {
        str = str.toString().replace(/\\\//g, "/").replace(/^\/|\/$/g, "");
        //console.log("str-conv",str);
      }
      //console.log("str",str);
      var list = fixTokens(str.match(_utils.TOKINIZATION_RX)); // tokenize the regular expression
      list = list || [];
      //let scripter = (p,tok)
      var s = list.reduce(function (parser, op) {
        return parser.addToken(op);
      }, new RxParser()); //perform the parsing
      if (s.val()) s.pushOp(DOT, 0);
      s.operand.push(DONE);
      s.pushOp(undefined, -1);
      return makeFSM(s.val());
    }
  }]);

  return RxParser;
}();

function printExpr(exp, paren) {
  if (paren && exp && exp.oper) return "(" + printExpr(exp) + ")";
  if (exp && exp.oper) {
    if (exp.oper.type == 'B') {
      if (exp.oper.op == '.') return "(" + printExpr(exp.left) + "." + printExpr(exp.right) + ")";
      return "(" + printExpr(exp.left) + "|" + printExpr(exp.right) + ")";
    } else if (exp.oper.type == 'U') {
      return "(" + printExpr(exp.left, false) + exp.oper.val + ")";
    }
  } else if (exp === DONE) return "<DONE>";else return exp.val;
}

function printExprN(exp, paren) {
  if (paren && exp && exp.oper) return "(" + printExpr(exp) + ")";
  if (exp && exp.oper) {
    if (exp.oper.type == 'B') {
      if (exp.oper.op == '.') {
        if (exp.nextNode) return "(" + printExprN(exp.left) + "." + printExprN(exp.nextNode) + ")";else return printExprN(exp.left);
      }
      return "(" + printExprN(exp.left) + "|" + printExprN(exp.right) + ")";
    } else if (exp.oper.type == 'U') {
      if (exp.nextNode) {
        return "((" + printExpr(exp.left, false) + exp.oper.val + ")." + printExprN(exp.nextNode) + ")";
      }
      return "(" + printExpr(exp.left, false) + exp.oper.val + ")";
    }
  } else if (exp === DONE) return "<DONE>";else {
    if (exp && exp.nextNode) return "(" + exp.val + "." + printExprN(exp.nextNode) + ")";
    return exp ? exp.val : '';
  }
}

// Generate a string that will match the regex.
//
/* Work in progress
export generateStr(aNode, prefix, chooser) {
 if( aNode === undefined ) return prefix;
  if( aNode === DONE ) return prefix;
  if( aNode.type === 'N' && aNode.oper === undefined ) 
    return genSingle(aNode,prefix,chooser);
  if( dot(aNode) ) return generateStr(aNode.right,generateStr(aNode.left,prefix, chooser), chooser); 
  if(zero_or_more(aNode) || zero_or_one(aNode)) {
    let ix = chooser.count(0,zero_or_one(aNode)?10:1, prefix);
    for(let i=0; i<ix; i++) {
      prefix = generateStr(aNode.left,prefix, chooser);
    }
    return prefix;
  }
  if( or(aNode) )  {
    // collect all the or nodes
    // pick one at random
    // use that to generate the string
    let n = aNode;
    let list = [];
    while( or(n)) {
      list.push(n.left);
      n = n.right;
    }
    list.push(n);
    n = selectRandom(list);
  }
  throw new Error("Copy of an invalid node " + aNode); 
}
*/