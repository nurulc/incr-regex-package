"use strict";

var _incrRegexV = require("../incr-regex-v3");

var _RXInputMask = require("../inputmask/RXInputMask");

var _regexpParser = require("../regexp-parser");

var _chai = require("chai");

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

function _skipFixed(aPattern, onlyFixed) {
  var s = aPattern.minChars();
  onlyFixed = !!onlyFixed;
  if ( /*onlyFixed !== true &&*/s.length > 1 && (0, _incrRegexV.isOptional)(s.charAt(0)) && !(0, _incrRegexV.isMeta)(s.charAt(1))) {
    if (aPattern.match(s.charAt(1))) return true;
  } else if ( /* onlyFixed === true && */s.length >= 1 && !(0, _incrRegexV.isMeta)(s.charAt(0))) return aPattern.match(s.charAt(0));
  return false;
}

function _skipAndMatch(aPattern, ch) {
  if (aPattern.match(ch)) {
    console.log("GOOD", c);
    return true;
  }

  var c = aPattern.minChars();
  if (!(0, _incrRegexV.isMeta)(c.charAt(0))) {
    console.log("fixed: (", c, ")");
  }
  var backup = aPattern.clone();
  while (_skipFixed(aPattern, false)) {
    if (aPattern.match(ch)) return true;
  }
  aPattern.reset();
  aPattern.matchStr(_after(backup, true, 0));
  return false;
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

function SEL(low, high) {
  return { start: low, end: high };
}

describe("RXInputMask Basic", function () {

  function ins(rxi, str) {
    for (var i = 0; i < str.length; i++) {
      rxi.input(str.charAt(i));
    }return rxi;
  }
  describe("Simple RxInputMask input testing", function () {
    // Example of use from the test cases
    //
    var rxi = new _RXInputMask.RXInputMask({ pattern: /aa[a-zA-Z]+@@\d+!!/ });
    it("1. pattern /aa[a-zA-Z]+@@\\d+!!/ 1", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      var r = ins(rxi, "aabcd");
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aaaabcd");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 7, end: 7 });
    });
    it("2. pattern /aa\[a-zA-Z]+@@\\d+!!/ ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      var r = ins(rxi, "aabcdefg");
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aaaabcdefg");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 10, end: 10 });
    });
    it("3. pattern /aa[a-zA-Z]+@@\\d+!!/ add 'aabcdefg' then add 'xyz' at pos 3", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg");
      rxi.selection.start = rxi.selection.end = 3;
      ins(rxi, "xyz");
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabxyzcdefg");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 6, end: 6 });
    });

    it("4. pattern /aa[a-zA-Z]+@@\\d+!!/ add 'aabcdefg@@12' then add 'xyz' at pos 3", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@@12');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12");
      rxi.selection.start = rxi.selection.end = 3;
      ins(rxi, "xyz");
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabxyzcdefg@@12");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 6, end: 6 });
    });
    it("5. pattern /aa[a-zA-Z]+@@\\d+!!/ add 'aabcdefg@@12' then add 'xyz' at pos 3..6", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@@12');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12");
      //rxi.select(3,6); //"cde"
      rxi.selection.start = 3;rxi.selection.end = 6;
      ins(rxi, "xyz");
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabxyzfg@@12");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 6, end: 6 });
    });
    it("6. pattern /aa[a-zA-Z]+@\\d+!!/ add 'aabcdefg' then skipFixed expect 'aabcdefg@@'", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg');
      rxi.skipFixed(false);
      rxi.skipFixed(true);
      (0, _chai.expect)(rxi._getValue()).to.deep.equal('aabcdefg@@');
    });
    it("7. pattern /aa[a-zA-Z]+@\\d+!!/ add 'aabcdefg12' then expect 'aabcdefg@@12'", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg12');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal('aabcdefg@@12');
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 12, end: 12 });
    });
    it("8. pattern /aa[a-zA-Z]+@@\d+!!/ add 'aabcdefg@@12' then selsect pos 4,10 ('defg@@1') input 'xyz' one character at a time ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@@12!');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      rxi.select(4, 11);
      rxi.input('x');
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("aabcx@@2!!"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 5, end: 5 });
      console.log("Regex:", rxi.pattern.matcher, " selection:", rxi.selection);
      console.log("current:", rxi.pattern.matcher.current, " selection:", rxi.selection);
      rxi.input('y');
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 6, end: 6 });
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("aabcxy@@2!!"));

      rxi.input('z');
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 7, end: 7 });
      //ins(rxi,"xyz");
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("aabcxyz@@2!!"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 7, end: 7 });
    });

    it("9. PASTE pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg@12' then add 'xyz' at pos ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@@12!!');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      rxi.select(4, 11);
      //rxi.selection.start = 4; rxi.selection.end = 10;
      rxi.paste('xyz');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcxyz@@2!!");
      //expect(rxi.selection).to.deep.equal({start: 7, end: 7});
    });
    it("10. backspace pattern /aa[a-zA-Z]+@@\\d+/ add 'aabcdefg@12' backspace at characte 4..4 ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@@12!!');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      rxi.select(4, 4);
      rxi.backspace();
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabdefg@@12!!");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 3, end: 3 });
    });
    it("11. backspace and undo pattern /aa[a-zA-Z]+@@\\d+/ add 'aabcdefg@12' backspace at characte 4..4 ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@@12!!');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      rxi.select(4, 4);
      rxi.backspace();
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabdefg@@12!!");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 3, end: 3 });
      rxi.undo();
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 4, end: 4 });
    });
    it("12. backspace and undo pattern /aa[a-zA-Z]+@@\\d+/ add 'aabcdefg@12' backspace at characte 3..5 ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@@12!!');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      rxi.select(3, 5);
      rxi.backspace();
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabefg@@12!!");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 3, end: 3 });
      rxi.undo();
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 3, end: 5 });
    });
    it("13. backspace and undo pattern /aa[a-zA-Z]+@@\\d+/ add 'aabcdefg@12' backspace at characte 2..12 then undo ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@@12!!');
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      rxi.select(2, 14);
      rxi.backspace();
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aa");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 2, end: 2 });
      rxi.undo();
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 2, end: 14 });
    });
    it("14. backspace and undo pattern /aa[a-zA-Z]+@@\\d+!!/ add 'aabcdefg@12' backspace at characte 2..12 then undo ", function () {
      rxi = new _RXInputMask.RXInputMask({ pattern: /aa[a-zA-Z]+@@\d+!!/ });
      (0, _chai.expect)(rxi.getValue()).to.deep.equal((0, _incrRegexV.convertMask)("aa_*@@_*!!"));
      ins(rxi, 'bcdefg@@12!!');
      rxi.pattern.minChars();
      //console.log(rxi.pattern," MinChars: ", rxi.pattern.minChars());
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      rxi.select(2, 14);
      rxi.backspace();
      (0, _chai.expect)(rxi.getValue()).to.deep.equal((0, _incrRegexV.convertMask)("aa_*@@_*!!"));
      (0, _chai.expect)(rxi.getRawValue()).to.deep.equal("");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 2, end: 2 });
      rxi.undo();
      (0, _chai.expect)(rxi.pattern.minChars()).to.deep.equal("");
      //console.log(rxi.pattern);
      (0, _chai.expect)(rxi.getRawValue()).to.deep.equal("bcdefg@12!");
      (0, _chai.expect)(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 2, end: 14 });
    });
  });

  describe("Fixed RxInputMask input testing", function () {
    // Example of use from the test cases
    //
    var rxi = new _RXInputMask.RXInputMask({ pattern: /\(\d{3}\)-\d{3}-\d{4}/ });
    it("0. Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ 1", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      var r = ins(rxi, "9");
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("(9__)-___-____"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 2, end: 2 });
      ins(rxi, "4");
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("(94_)-___-____"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 3, end: 3 });
      rxi.select(2, 2);
      ins(rxi, "1");
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("(914)-___-____"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 3, end: 3 });
    });
    it("1. Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ 1", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      var r = ins(rxi, "9147259843");
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("(914)-725-9843"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 14, end: 14 });
    });
    it("2 Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ delete (1,4)", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      var r = ins(rxi, "9147259843");
      rxi.select(1, 4);
      rxi.backspace();
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("(725)-984-3___"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 1, end: 1 });
    });
    it("2a Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ delete (1,4)", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      var r = ins(rxi, "147259843");
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("(147)-259-843"));
      (0, _chai.expect)(rxi.getRawValue()).to.equal((0, _incrRegexV.convertMask)("147259843"));
      rxi.select(1, 1);
      ins(rxi, '9');
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("(914)-725-9843"));
      rxi.select(1, 4);
      rxi.backspace();
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("(725)-984-3___"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 1, end: 1 });
    });
    it("3 Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ delete (1,4) insert 999", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      var r = ins(rxi, "9147259843");
      rxi.select(1, 4);
      rxi.backspace();
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("(725)-984-3___"));
      (0, _chai.expect)(rxi.getRawValue()).to.equal((0, _incrRegexV.convertMask)("7259843"));
      ins(rxi, "9");
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("(972)-598-43"));
      ins(rxi, "87");
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("(987)-725-9843"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 4, end: 4 });
    });
    it("5 Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ delete (6,10) insert 7160", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      var r = ins(rxi, "9147259843");
      rxi.select(6, 10);
      rxi.backspace();
      //console.log(rxi.pattern);
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("(914)-984-3___"));
      //console.log(rxi.pattern);
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 6, end: 6 });
      (0, _chai.expect)(rxi.getRawValue()).to.equal((0, _incrRegexV.convertMask)("9149843"));
      (0, _chai.expect)(rxi.getRawValueAt(6)).to.equal((0, _incrRegexV.convertMask)("9843"));
      ins(rxi, "7");
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("(914)-798-43"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 7, end: 7 });
      ins(rxi, "16");
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("(914)-716-9843"));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 9, end: 9 });
    });
  });

  describe("Check MaskedInput behavior", function () {
    // Example of use from the test cases
    //
    var rxi = new _RXInputMask.RXInputMask({ pattern: /\d{4}-\d{4}/ });
    it("0. Fixed pattern /\\d{4}-\\d{4}", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      (0, _chai.expect)(rxi.pattern.minChars()).to.equal((0, _incrRegexV.convertMask)("____-____"));
      var r = ins(rxi, "1");
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("1___-____"));
      (0, _chai.expect)(rxi.pattern.minChars()).to.equal((0, _incrRegexV.convertMask)("___-____"));

      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 1, end: 1 });
      rxi.setValue((0, _incrRegexV.convertMask)("1___-____"));
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("1___-____"));
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("1"));
      rxi.setValue((0, _incrRegexV.convertMask)("12__-____"));
      (0, _chai.expect)(rxi._getValue()).to.equal((0, _incrRegexV.convertMask)("12"));
      //console.log(rxi);
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("12__-____"));
      (0, _chai.expect)(rxi.pattern.minChars()).to.equal((0, _incrRegexV.convertMask)("__-____"));
      rxi.setValue((0, _incrRegexV.convertMask)("12__-____"));
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("12__-____"));
      rxi.setValue((0, _incrRegexV.convertMask)("123_-____"));
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("123_-____"));
      (0, _chai.expect)(rxi.pattern.minChars()).to.equal((0, _incrRegexV.convertMask)("_-____"));
      rxi.setValue((0, _incrRegexV.convertMask)("123_-____"));
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("123_-____"));
      rxi.setValue((0, _incrRegexV.convertMask)("1234-____"));
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("1234-____"));
      rxi.setValue((0, _incrRegexV.convertMask)("1234-____"));
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("1234-____"));
      //console.log(rxi.pattern);
      (0, _chai.expect)(rxi.pattern.minChars()).to.equal((0, _incrRegexV.convertMask)("-____"));
      _skipAndMatch(rxi.pattern, '5');
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("1234-5___"));
      rxi.setValue((0, _incrRegexV.convertMask)("1234-5___"));
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("1234-5___"));
    });
  });
  describe("Check MaskedInput behavior backspace", function () {
    var rxi = new _RXInputMask.RXInputMask({ pattern: /\d{4}-\d{4}/ });
    it("0. Fixed pattern /\\d{4}-\\d{4}", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      var r = ins(rxi, "1");
      (0, _chai.expect)(rxi.getValue()).to.equal((0, _incrRegexV.convertMask)("1___-____"));
      (0, _chai.expect)(rxi.pattern.minChars()).to.equal((0, _incrRegexV.convertMask)("___-____"));
      rxi.setSelection(SEL(1, 1));
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 1, end: 1 });
      rxi.setValue((0, _incrRegexV.convertMask)("1___-____"));
      (0, _chai.expect)(rxi.pattern.getFirstEditableAtOrAfter(0)).to.equal(0);
      var start = rxi.selection.start,
          end = rxi.selection.end;
      (0, _chai.expect)(start).to.equal(end);
      (0, _chai.expect)(rxi.pattern.getFirstEditableAtOrBefore(start - 1)).to.equal(0);
      end = 1;
      rxi.backspace();
      (0, _chai.expect)(rxi._getValue()).to.equal("");
    });
  });
});