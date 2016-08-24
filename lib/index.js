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
exports.isHolder = exports.isOptional = exports.isMeta = exports.convertMask = exports.IREGEX = exports.RxMatcher = exports.contract = exports.RXInputMask = exports.RxParser = exports.printExprS = exports.printExpr = exports.incrRegEx = exports.advancedRxMatcher = exports.rxGetActualStartState = exports.rxCanReach = exports.rxMatch = exports.rxNextState = exports.rxMatchArr = exports.makeFSM = exports.makeCharSet = exports.stdRxMeta = exports.copyNode = exports.RX_ONE_OR_MORE = exports.RX_ZERO_OR_MORE = exports.RX_ZERO_OR_ONE = exports.RX_OR = exports.RX_CONS = exports.RX_UNARY = exports.RX_OP = exports.FAILED = exports.MORE = exports.MAYBE = exports.DONE = exports.FALSE = exports.DOT = exports.ONE_OR_MORE = exports.ZERO_OR_MORE = exports.ZERO_OR_ONE = exports.OR = exports.RP = exports.LP = exports.BS = exports.SKIP = exports.OP = exports.charset = exports.anychar = exports.zero_or_more = exports.zero_or_one = exports.or = exports.dot = exports.boundary = exports.matchable = exports.BOUNDARY = exports.PERHAPS_MORE = exports.TERM = exports.MANY = undefined;

var _utils = require("./utils");

var _regexpParser = require("./regexp-parser");

var _rxtree = require("./rxtree");

var _incrRegexV = require("./incr-regex-v3");

var _rxprint = require("./rxprint");

var _RxInputMask = require("./inputmask/RxInputMask");

var _RxMatcher = require("./RxMatcher");

if (_incrRegexV.incrRegEx === undefined) throw new Error("incrRegEx not defined");
if (_RxInputMask.RXInputMask === undefined) throw new Error("RXInputMask not defined");
if (_RxMatcher.RxMatcher === undefined) throw new Error("RxMatcher not defined");
/*export default {
	DONE,MORE,MAYBE,FAILED,incrRegEx,printExpr,RxParser,RXInputMask, contract, RxMatcher,
	matchable,dot,or,zero_or_one,zero_or_more, IREGEX, 
	convertMask ,isMeta, isOptional,isHolder 
};*/

exports.MANY = _rxtree.MANY;
exports.TERM = _rxtree.TERM;
exports.PERHAPS_MORE = _rxtree.PERHAPS_MORE;
exports.BOUNDARY = _rxtree.BOUNDARY;
exports.matchable = _rxtree.matchable;
exports.boundary = _rxtree.boundary;
exports.dot = _rxtree.dot;
exports.or = _rxtree.or;
exports.zero_or_one = _rxtree.zero_or_one;
exports.zero_or_more = _rxtree.zero_or_more;
exports.anychar = _rxtree.anychar;
exports.charset = _rxtree.charset;
exports.OP = _rxtree.OP;
exports.SKIP = _rxtree.SKIP;
exports.BS = _rxtree.BS;
exports.LP = _rxtree.LP;
exports.RP = _rxtree.RP;
exports.OR = _rxtree.OR;
exports.ZERO_OR_ONE = _rxtree.ZERO_OR_ONE;
exports.ZERO_OR_MORE = _rxtree.ZERO_OR_MORE;
exports.ONE_OR_MORE = _rxtree.ONE_OR_MORE;
exports.DOT = _rxtree.DOT;
exports.FALSE = _rxtree.FALSE;
exports.DONE = _rxtree.DONE;
exports.MAYBE = _rxtree.MAYBE;
exports.MORE = _rxtree.MORE;
exports.FAILED = _rxtree.FAILED;
exports.RX_OP = _rxtree.RX_OP;
exports.RX_UNARY = _rxtree.RX_UNARY;
exports.RX_CONS = _rxtree.RX_CONS;
exports.RX_OR = _rxtree.RX_OR;
exports.RX_ZERO_OR_ONE = _rxtree.RX_ZERO_OR_ONE;
exports.RX_ZERO_OR_MORE = _rxtree.RX_ZERO_OR_MORE;
exports.RX_ONE_OR_MORE = _rxtree.RX_ONE_OR_MORE;
exports.copyNode = _rxtree.copyNode;
exports.stdRxMeta = _rxtree.stdRxMeta;
exports.makeCharSet = _rxtree.makeCharSet;
exports.makeFSM = _rxtree.makeFSM;
exports.rxMatchArr = _rxtree.rxMatchArr;
exports.rxNextState = _rxtree.rxNextState;
exports.rxMatch = _rxtree.rxMatch;
exports.rxCanReach = _rxtree.rxCanReach;
exports.rxGetActualStartState = _rxtree.rxGetActualStartState;
exports.advancedRxMatcher = _rxtree.advancedRxMatcher;
exports.incrRegEx = _incrRegexV.incrRegEx;
exports.printExpr = _rxprint.printExpr;
exports.printExprS = _rxprint.printExprS;
exports.RxParser = _regexpParser.RxParser;
exports.RXInputMask = _RxInputMask.RXInputMask;
exports.contract = _utils.contract;
exports.RxMatcher = _RxMatcher.RxMatcher;
exports.matchable = _rxtree.matchable;
exports.dot = _rxtree.dot;
exports.or = _rxtree.or;
exports.zero_or_one = _rxtree.zero_or_one;
exports.zero_or_more = _rxtree.zero_or_more;
exports.IREGEX = _incrRegexV.IREGEX;
exports.convertMask = _incrRegexV.convertMask;
exports.isMeta = _incrRegexV.isMeta;
exports.isOptional = _incrRegexV.isOptional;
exports.isHolder = _incrRegexV.isHolder;

/*
window.incrRegEx = {
  DONE,MORE,MAYBE,FAILED,incrRegEx,printExpr,RxParser,RXInputMask, contract, RxMatcher,
  matchable,dot,or,zero_or_one,zero_or_more, IREGEX, 
  convertMask ,isMeta, isOptional,isHolder 
};
*/
/*
const contract = {
  nat32,
  func, isFunc,
  typeOf, isTypeOf,
  arr, isArr,
  classOf, isClassOf,
  instanceOf, 
  isUndef
};


*/