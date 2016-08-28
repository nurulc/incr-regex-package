"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RXTREE = exports.HOLDER_ZERO_OR_ONE = exports.HOLDER_ANY = exports.HOLDER_ZERO_OR_MORE = exports.FAILED = exports.MAYBE = exports.MORE = exports.DONE = exports.ANYCH = exports.FALSE = exports.DOT = exports.ONE_OR_MORE = exports.ZERO_OR_MORE = exports.ZERO_OR_ONE = exports.OR = exports.RP = exports.LP = exports.BS = exports.SKIP = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); //rxtree.js
//import {printExpr} from "./rxprint"; 
// debugging only


exports.MANY = MANY;
exports.TERM = TERM;
exports.PERHAPS_MORE = PERHAPS_MORE;
exports.BOUNDARY = BOUNDARY;
exports.OP = OP;
exports.stdRxMeta = stdRxMeta;
exports.makeCharSet = makeCharSet;
exports.matchable = matchable;
exports.boundary = boundary;
exports.dot = dot;
exports.or = or;
exports.zero_or_one = zero_or_one;
exports.zero_or_more = zero_or_more;
exports.anychar = anychar;
exports.charset = charset;
exports.RX_OP = RX_OP;
exports.RX_UNARY = RX_UNARY;
exports.RX_CONS = RX_CONS;
exports.RX_OR = RX_OR;
exports.RX_ZERO_OR_MORE = RX_ZERO_OR_MORE;
exports.RX_ZERO_OR_ONE = RX_ZERO_OR_ONE;
exports.RX_ONE_OR_MORE = RX_ONE_OR_MORE;
exports.copyNode = copyNode;
exports.makeFSM = makeFSM;
exports.getArrayFixedAt = getArrayFixedAt;
exports.rxMatch = rxMatch;
exports.rxMatchArr = rxMatchArr;
exports.rxNextState = rxNextState;
exports.computeReachableList = computeReachableList;
exports.rxContentsToMask = rxContentsToMask;
exports.rxGetActualStartState = rxGetActualStartState;
exports.rxStepArr = rxStepArr;
exports.advancedRxMatcher = advancedRxMatcher;

var _utils = require("./utils");

var _incrRegexV = require("./incr-regex-v3");

var _rxprint = require("./rxprint");

// debugging
function MANY() {}
function TERM() {}
function PERHAPS_MORE() {}
function BOUNDARY() {}

function OP(x, msg) {
  var toStr = function toStr() {
    return msg || x.val;
  };
  x.toString = toStr;
  return x;
}
var MATCH_TRUE = [true, undefined];
var MATCH_FALSE = [false, undefined];

function anych(ch) {
  return ch !== DONE ? MATCH_TRUE : MATCH_FALSE;
}

var SKIP = exports.SKIP = OP({ type: 'N', val: "<SKIP>", multi: TERM, op: 'SKIP', match: anych });
var BS = exports.BS = OP({ type: 'N', val: "\b", multi: TERM, op: 'SINGLE', match: __match(/[\b]/) });
var LP = exports.LP = OP({ type: 'L', val: ')' });
var RP = exports.RP = OP({ type: 'R', val: ')' });
var OR = exports.OR = OP({ type: 'B', val: '|', op: 'OR' });
var ZERO_OR_ONE = exports.ZERO_OR_ONE = OP({ type: 'U', val: "?", op: 'MULTI' });
var ZERO_OR_MORE = exports.ZERO_OR_MORE = OP({ type: 'U', val: "*", op: 'MULTI' });
var ONE_OR_MORE = exports.ONE_OR_MORE = OP({ type: 'U', val: "+", op: 'MULTI' });
var DOT = exports.DOT = OP({ type: 'B', val: '.', op: '.' });
var FALSE = exports.FALSE = function FALSE() {
  return false;
};

var ANYCH = exports.ANYCH = function ANYCH() {
  return OP({ type: 'N', val: "(.)", multi: MANY, op: 'ANY', match: anych });
};
var DONE = exports.DONE = OP({ type: 'N', val: "DONE", multi: BOUNDARY, op: 'DONE', match: FALSE }); // cannot match any more
var MORE = exports.MORE = OP({ type: 'N', val: "MORE", multi: BOUNDARY, op: 'MORE', match: FALSE }); // regex not yet done, more to match
var MAYBE = exports.MAYBE = OP({ type: 'N', val: "MAYBE", multi: BOUNDARY, op: 'MAYBE', match: FALSE }); // done, but could match more
var FAILED = exports.FAILED = OP({ type: 'N', val: "FAILED", multi: BOUNDARY, op: 'FAILED', match: FALSE }); // (should never be here) the pattern does not match

function __match(regexp) {
  return function (ch) {
    return !!(ch !== DONE && (ch === undefined || ch.match(regexp))) ? MATCH_TRUE : MATCH_FALSE;
  };
}

var _stdRegexp = { "\\d": __match(/\d/),
  "\\D": __match(/\D/),
  "\\s": __match(/\s/),
  "\\S": __match(/\S/),
  "\\w": __match(/\w/),
  "\\W": __match(/\W/) };

function stdRxMeta(str) {
  return { type: 'N', val: str, multi: MANY, op: 'SPECIAL-CHARSET', match: _stdRegexp[str] };
}
function makeCharSet(str) {
  return { type: 'N', val: str, multi: MANY, op: 'CHARSET', match: __match(new RegExp(str)) };
}

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

function RX_OP(op, a, b) {
  if (op === DOT) return RX_CONS(a, b);
  if (op === OR) return RX_OR(a, b);
  return !b ? a : { oper: op, left: a, right: b };
}

function RX_UNARY(op, a) {
  return { oper: op, left: a };
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
function RX_ZERO_OR_ONE(a) {
  return { oper: ZERO_OR_ONE, left: a };
}
function RX_ONE_OR_MORE(a) {
  return RX_CONS(a, RX_ZERO_OR_MORE(copyNode(a)));
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
//

//========== CODE TO CHECK MINIMUM NUMBER of characters that must be input to finish the RegEx
//const HOLDER_ZERO_OR_MORE = '*';//"\u20e4" "\u2733" "\u2026";
//const HOLDER_ANY = '_';//"\u2581";
//const HOLDER_ZERO_OR_ONE = "?";//  "\u21a0"

var HOLDER_ZERO_OR_MORE = exports.HOLDER_ZERO_OR_MORE = "⋯"; // "\u26b9"; //"\u20e4" ;
var HOLDER_ANY = exports.HOLDER_ANY = "＿"; //"\u268a";//"\u05b7";//"\u035f"; ////"\u2581"; //"\u0332"; //"\u268a"; //
var HOLDER_ZERO_OR_ONE = exports.HOLDER_ZERO_OR_ONE = "◑"; //"\u21a0";

/*
const HOLDER_ZERO_OR_MORE = "*";
const HOLDER_ANY = "_";
const HOLDER_ZERO_OR_ONE = "?"

*/

// === SOME RegExp tree utils =====

function makeFSM(t, connector) {
  if ((matchable(t) || boundary(t)) && connector) {
    // t => t->connector
    t.nextNode = connector;
    return t;
  } else if (dot(t)) {
    //( . l r) => l->r->connector
    var right = connector ? makeFSM(t.right, connector) : t.right;
    //    if( right && boundary(right) 
    //              && connector === DONE ) right = DONE; //  left.(\b.DONE) last thing is a word boundary just remove it
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

function fixedAt(rxNode) {

  if (!rxNode || rxNode === DONE) return undefined;
  if (dot(rxNode)) {
    // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
    return fixedAt(rxNode.left);
  } else if (matchable(rxNode)) {
    var res = matchable(rxNode)(undefined);
    return res[1]; // undefined if this is not a fixed character
  } else if (or(rxNode)) {
    //  /A|B/ => or(A,B)
    var chL = fixedAt(rxNode.left);
    var chR = fixedAt(rxNode.right);
    return chL === chR ? chL : undefined; // only true if the same char begins bot portions of the OR ( left | right )
  } else if (zero_or_one(rxNode) || zero_or_more(rxNode) || boundary(rxNode)) {
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

function rxMatch(rxN, ch, lastCh) {
  var matchState = arguments.length <= 3 || arguments[3] === undefined ? new _utils.StackDedup() : arguments[3];

  if (rxN === DONE) {
    if (ch === DONE) {
      matchState.push(DONE);
      return DONE;
    }
    return FAILED;
  } else if (dot(rxN)) {
    return rxMatch(rxN.left, ch, lastCh, matchState);
  } else if (or(rxN)) {
    var rl = rxMatch(rxN.left, ch, lastCh, matchState);
    var rr = rxMatch(rxN.right, ch, lastCh, matchState);
    return _result(rl, rr);
  } else if (zero_or_one(rxN) || zero_or_more(rxN)) {
    var _rl = boundary(rxN.left) ? DONE : rxMatch(rxN.left, ch, lastCh, matchState);
    var _rr = rxMatch(rxN.nextNode, ch, lastCh, matchState);
    return _result(_rl, _rr);
  } else if (matchable(rxN)) {
    var res = rxN.match(ch);
    if (res[0]) {
      matchState.push(rxN);
    }
    return res[0] ? rxN.nextNode === DONE ? DONE : MORE : FAILED;
  } else if (boundary(rxN)) {
    //if( ch === DONE && this.nurul) console.log("boundary",ch)
    if (ch === DONE) return rxMatch(rxN.nextNode, ch, lastCh, matchState); // ignore the boundary

    var _res = rxN.match(lastCh, ch);
    if (_res[0] || ch === undefined) {
      return rxMatch(rxN.nextNode, ch, lastCh, matchState);
    }
    return FAILED;
  }
  return FAILED;
}

function _result(l, r) {
  if (l === FAILED) return r;
  if (l === MAYBE) return MAYBE;
  if (l === MORE) return r === DONE || r === MAYBE ? MAYBE : MORE;
  /*if( l === DONE )*/
  return r === MORE || r === MAYBE ? MAYBE : DONE;
}

// Resturns a list of nodes that Match currState

function rxMatchArr(ch, lastCh, currState, matchState) {
  matchState = matchState === undefined || matchState !== currState ? new _utils.StackDedup() : matchState;
  var res = currState.reduce(function (res, rxN) {
    return _result(rxMatch(rxN, ch, lastCh, matchState), res);
  }, FAILED);
  if (res === FAILED || matchState.length === 0) {
    return undefined;
  }
  return matchState;
}

// immutable function that takes the currentState and generates the next state

function rxNextState(currState) {
  var len = currState.length;
  var nextState = new _utils.StackDedup();
  for (var i = 0; i < len; i++) {
    var rxN = currState.data[i];
    nextState.push(rxN === DONE ? DONE : rxN.nextNode);
  }
  return nextState; // destructive change to the state
}

/*
   Given a reg-expr node rxN, can we reach any element in the list rxN in one step.

   This is the typical thing historians do, knowing what happens in the future can we 
   find the decissions we made to get there. 
   We get this issue whe we delete text, let me give a simple example:
   regexp = /Phone: \d{3}-\d{3}-\d{4}|Pack: \d{3}:\d{7}/

   So we can enter something like this
     "Phone: 212-768-1234" or
     "Pack: 789:7654321"

     now suppose we entered: the second "Pack: 789:7654321"
     now we delete the begining of the text:
     "______________321", but we know that the begining should be fixed
     so should be put "Phone: ___...", or "Pack: ___", this is the future problem.
     
     - We know that the text should end in "...321", so what can we tell about the past
     so that we can reach here. Clearly come thing will be some thisgs unknown, but can we deduce
     anything about the past (in out case the prefix string).
     We know that the first letter must be a 'P'
     "P_____________321" so what are out outions
     "Phone: ___-___-"  clearly this is not goin to fit sinece we need a '-' where the '3' has to be
     but:
     "Pack: ___:____"   This case clearly fits. This is a simple exmaple, and a regexp can get very complicated

     This a an attempt to do the best filling details uning the principle of least surprise, but also allow the user
     to edit the input in any legal way without haveing to deleting everything and starting again


     Params:
     	rxN - node in a regexp FSM (finite state machine)
     	rxTargetStateList - the target state we need to reach
*/

function rxCanReach(rxN, rxTargetStateList, stop) {
  if (rxN === stop) return undefined;
  if (rxN === DONE || rxN === undefined) return undefined;else if (dot(rxN)) {
    return rxCanReach(rxN.left, rxTargetStateList, stop);
  } else if (or(rxN)) {
    return rxCanReach(rxN.left, rxTargetStateList, stop) || rxCanReach(rxN.right, rxTargetStateList, stop);
  } else if (zero_or_one(rxN) || zero_or_more(rxN)) {
    return rxCanReach(rxN.left, rxTargetStateList, rxN) || rxCanReach(rxN.nextNode, rxTargetStateList, stop);
  } else if (boundary(rxN)) {
    return rxCanReach(rxN.nextNode, rxTargetStateList, stop); // ignore the boundary
  } else if (matchable(rxN)) {
    if (rxTargetStateList.contains(rxN)) return rxN;
    /* if( matchable(rxN.nextNode) ) {
     	   if( rxTargetStateList.contains(rxN.nextNode) )  return rxN;
     	   return undefined;
     } */
    //return rxCanReach(rxN.nextNode,rxTargetStateList,stop);
    return undefined; //
  }
  return undefined;
}

function computeReachableList(arrIn) {
  if (arrIn === undefined || arrIn.length < 2) return arrIn;
  var arr = arrIn.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var _ref2$ = _slicedToArray(_ref2[0], 2);

    var m = _ref2$[0];
    var pm = _ref2$[1];
    var c = _ref2[1];
    return [[m, pm], c];
  });

  var _loop = function _loop(i) {
    var _arr$i = _slicedToArray(arr[i], 2);

    var _arr$i$ = _slicedToArray(_arr$i[0], 2);

    var match0 = _arr$i$[0];
    var possibleMatch0 = _arr$i$[1];
    var c0 = _arr$i[1];

    var _arr = _slicedToArray(arr[i + 1], 2);

    var _arr$ = _slicedToArray(_arr[0], 2);

    var match1 = _arr$[0];
    var possibleMatch1 = _arr$[1];
    var c1 = _arr[1];
    //let result0 = rxNextState(match0).filter( v => rxCanReach(v,match1) );

    var result0 = match0.filter(function (v) {
      var res = rxCanReach(v.nextNode, match1);
      //if( res !== undefined  ) console.log("can Reach :" +printExprN(v), match1.map(printExpr)); 
      return res;
    });

    var cr = getArrayFixedAt(result0) || c0;
    arr[i] = [[result0, possibleMatch0], cr];
  };

  for (var i = arr.length - 2; i >= 0; i--) {
    _loop(i);
  }
  return arr;
}

function rxContentsToMask(rxTree, contents) {
  var _advancedRxMatcher = advancedRxMatcher(rxTree, contents);

  var _advancedRxMatcher2 = _slicedToArray(_advancedRxMatcher, 4);

  var isOk = _advancedRxMatcher2[0];
  var lastCh = _advancedRxMatcher2[1];
  var currState = _advancedRxMatcher2[2];
  var res = _advancedRxMatcher2[3];

  if (!isOk) return undefined;
  var reachableList = computeReachableList(res);
  return reachableList.reduce(function (str, _ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var state = _ref4[0];
    var ch = _ref4[1];
    return str + (ch || HOLDER_ANY);
  }, '');
}

/*

	Given an initial set of possible states, which of those acutually get to the targer state.
	this is the way we determine form a known future state of a regexp match, we can recreate the 
	previous states we could have been in. This is to determine that fixed value that must occur in the 
	previous states

*/

function rxGetActualStartState(possibleStartState, targetState) {
  return possibleStartState.map(function (rxN) {
    return rxCanReach(rxN, targetState);
  }).filter(function (a) {
    return a !== undefined;
  });
}

function rxStepArr(c, lastCh, currState) {
  if (currState === undefined) return undefined;

  var possibleStates = rxNextState(currState);
  var matchingStates = rxMatchArr(c === HOLDER_ANY ? undefined : c, lastCh, possibleStates); //rxMatchArr(ch, lastCh, currState, matchState)
  return matchingStates !== undefined ? [matchingStates, possibleStates] : undefined;
}

function advancedRxMatcherOLD(rxN, str) {
  var state0 = new _utils.StackDedup(rxN);
  var firstCh = str.charAt(0);
  var res = rxMatch(rxN, firstCh, undefined, state0);
  if (res === FAILED) return [false, undefined, undefined, []];

  return str.substr(1).split('').reduce(function (_ref5, c) {
    var _ref6 = _slicedToArray(_ref5, 4);

    var isOk = _ref6[0];
    var lastCh = _ref6[1];
    var currState = _ref6[2];
    var res = _ref6[3];

    var nextState = undefined;
    if (isOk) {
      nextState = rxStepArr(c, lastCh, currState);
      // do we need to perform case conversion here? 
      // i.e. switch the case if c is alphabetic
    }

    if (nextState !== undefined) {
      res.push([nextState, c]);
      return [true, c, nextState, res];
    }
    return [false, lastCh, currState, res];
  }, [true, firstCh, state0, [[state0, firstCh]]]);
}

function advancedRxMatcher(rxN, str) {
  var startNode = {};startNode.nextNode = rxN; // fake head node, we need to do this because the first 
  // action is to move evrything to next state
  return str.split('').reduce(function (_ref7, c) {
    var _ref8 = _slicedToArray(_ref7, 4);

    var isOk = _ref8[0];
    var lastCh = _ref8[1];
    var currState = _ref8[2];
    var res = _ref8[3];

    var nextState = undefined;
    if (isOk) {
      nextState = rxStepArr(c, lastCh, currState);
      // do we need to perform case conversion here? 
      // i.e. switch the case if c is alphabetic
    }

    if (nextState !== undefined) {
      res.push([nextState, c]);
      return [true, c, nextState[0], res];
    }
    return [false, lastCh, currState, res];
  }, [true, undefined, new _utils.StackDedup(startNode), []]);
}

var RXTREE = exports.RXTREE = { MANY: MANY, TERM: TERM, PERHAPS_MORE: PERHAPS_MORE, BOUNDARY: BOUNDARY, matchable: matchable, boundary: boundary, dot: dot, or: or, zero_or_one: zero_or_one, zero_or_more: zero_or_more, anychar: anychar, charset: charset, OP: OP,
  SKIP: SKIP, BS: BS, LP: LP, RP: RP, OR: OR, ZERO_OR_ONE: ZERO_OR_ONE, ZERO_OR_MORE: ZERO_OR_MORE, ONE_OR_MORE: ONE_OR_MORE, DOT: DOT, FALSE: FALSE, DONE: DONE, MAYBE: MAYBE, MORE: MORE, FAILED: FAILED,
  RX_OP: RX_OP, RX_UNARY: RX_UNARY, RX_CONS: RX_CONS, RX_OR: RX_OR, RX_ZERO_OR_ONE: RX_ZERO_OR_ONE, RX_ZERO_OR_MORE: RX_ZERO_OR_MORE, RX_ONE_OR_MORE: RX_ONE_OR_MORE, copyNode: copyNode, stdRxMeta: stdRxMeta,
  makeCharSet: makeCharSet, makeFSM: makeFSM, getArrayFixedAt: getArrayFixedAt, rxMatchArr: rxMatchArr, rxNextState: rxNextState, rxMatch: rxMatch, rxStepArr: rxStepArr,
  rxCanReach: rxCanReach, rxGetActualStartState: rxGetActualStartState, advancedRxMatcher: advancedRxMatcher, HOLDER_ZERO_OR_MORE: HOLDER_ZERO_OR_MORE, HOLDER_ANY: HOLDER_ANY, HOLDER_ZERO_OR_ONE: HOLDER_ZERO_OR_ONE
};