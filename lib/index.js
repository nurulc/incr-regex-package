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
exports.isHolder = exports.isOptional = exports.isMeta = exports.convertMask = exports.IREGEX = exports.zero_or_more = exports.zero_or_one = exports.or = exports.dot = exports.matchable = exports.RxMatcher = exports.contract = exports.RXInputMask = exports.RxParser = exports.printExpr = exports.incrRegEx = exports.FAILED = exports.MAYBE = exports.MORE = exports.DONE = undefined;

var _utils = require("./utils");

var _regexpParser = require("./regexp-parser");

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

exports.DONE = _regexpParser.DONE;
exports.MORE = _regexpParser.MORE;
exports.MAYBE = _regexpParser.MAYBE;
exports.FAILED = _regexpParser.FAILED;
exports.incrRegEx = _incrRegexV.incrRegEx;
exports.printExpr = _rxprint.printExpr;
exports.RxParser = _regexpParser.RxParser;
exports.RXInputMask = _RxInputMask.RXInputMask;
exports.contract = _utils.contract;
exports.RxMatcher = _RxMatcher.RxMatcher;
exports.matchable = _regexpParser.matchable;
exports.dot = _regexpParser.dot;
exports.or = _regexpParser.or;
exports.zero_or_one = _regexpParser.zero_or_one;
exports.zero_or_more = _regexpParser.zero_or_more;
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