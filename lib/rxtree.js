'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
//rxtree.js


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

var RXTREE = exports.RXTREE = { MANY: MANY, TERM: TERM, PERHAPS_MORE: PERHAPS_MORE, BOUNDARY: BOUNDARY, matchable: matchable, boundary: boundary, dot: dot, or: or, zero_or_one: zero_or_one, zero_or_more: zero_or_more, anychar: anychar, charset: charset, OP: OP,
  SKIP: SKIP, BS: BS, LP: LP, RP: RP, OR: OR, ZERO_OR_ONE: ZERO_OR_ONE, ZERO_OR_MORE: ZERO_OR_MORE, ONE_OR_MORE: ONE_OR_MORE, DOT: DOT, FALSE: FALSE,
  RX_OP: RX_OP, RX_UNARY: RX_UNARY, RX_CONS: RX_CONS, RX_OR: RX_OR, RX_ZERO_OR_ONE: RX_ZERO_OR_ONE, RX_ZERO_OR_MORE: RX_ZERO_OR_MORE, RX_ONE_OR_MORE: RX_ONE_OR_MORE, copyNode: copyNode, stdRxMeta: stdRxMeta, makeCharSet: makeCharSet, makeFSM: makeFSM };