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

var _utils = require("./utils");

var _regexpParser = require("./regexp-parser");

var _incrRegexV = require("./incr-regex-v3");

var _RxInputMask = require("./inputmask/RxInputMask");

var _RxMatcher = require("./RxMatcher");

if (_incrRegexV.incrRegEx === undefined) throw new Error("incrRegEx not defined");
if (_RxInputMask.RXInputMask === undefined) throw new Error("RXInputMask not defined");
if (_RxMatcher.RxMatcher === undefined) throw new Error("RxMatcher not defined");
exports.default = {
  DONE: _regexpParser.DONE, MORE: _regexpParser.MORE, MAYBE: _regexpParser.MAYBE, FAILED: _regexpParser.FAILED, incrRegEx: _incrRegexV.incrRegEx, printExpr: _regexpParser.printExpr, RxParser: _regexpParser.RxParser, RXInputMask: _RxInputMask.RXInputMask, contract: _utils.contract, RxMatcher: _RxMatcher.RxMatcher,
  matchable: _regexpParser.matchable, dot: _regexpParser.dot, or: _regexpParser.or, zero_or_one: _regexpParser.zero_or_one, zero_or_more: _regexpParser.zero_or_more, IREGEX: _incrRegexV.IREGEX,
  convertMask: _incrRegexV.convertMask, isMeta: _incrRegexV.isMeta, isOptional: _incrRegexV.isOptional, isHolder: _incrRegexV.isHolder
};

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