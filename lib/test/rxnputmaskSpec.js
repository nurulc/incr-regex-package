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

describe("RXInputMask Basic", function () {

  function ins(rxi, str) {
    for (var i = 0; i < str.length; i++) {
      rxi.input(str.charAt(i));
    }return rxi;
  }
  describe("Simple RxInputMask input testing", function () {
    // Example of use from the test cases
    //
    var rxi = new _RXInputMask.RXInputMask({ pattern: /aa[a-zA-Z]+@\d+/ });
    it("1. pattern /aa[a-zA-Z]+@\\d+/ 1", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      var r = ins(rxi, "aabcd");
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aaaabcd");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 7, end: 7 });
    });
    it("2. pattern /aa\[a-zA-Z]+@\\d+/ ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      var r = ins(rxi, "aabcdefg");
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aaaabcdefg");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 10, end: 10 });
    });
    it("3. pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg' then add 'xyz' at pos 3", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg');
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabcdefg");
      rxi.selection.start = rxi.selection.end = 3;
      ins(rxi, "xyz");
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabxyzcdefg");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 6, end: 6 });
    });

    it("4. pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg@12' then add 'xyz' at pos 3", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@12');
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabcdefg@12");
      rxi.selection.start = rxi.selection.end = 3;
      ins(rxi, "xyz");
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabxyzcdefg@12");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 6, end: 6 });
    });
    it("5. pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg@12' then add 'xyz' at pos 3", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@12');
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabcdefg@12");
      rxi.select(3, 6); //"cde"
      ins(rxi, "xyz");
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabxyzfg@12");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 6, end: 6 });
    });
    it("6. pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg' then skipFixed expect 'aabcdefg@'", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg');
      rxi.pattern.skipFixed();
      (0, _chai.expect)(rxi.getValue()).to.deep.equal('aabcdefg@');
    });
    it("7. pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg12' then expect 'aabcdefg@12'", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg12');
      (0, _chai.expect)(rxi.getValue()).to.deep.equal('aabcdefg@12');
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 11, end: 11 });
    });
    it("8. pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg@12' then add 'xyz' at pos 4,10 'defg@1' ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@12');
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabcdefg@12");
      rxi.select(4, 10);
      ins(rxi, "xyz");
      (0, _chai.expect)(rxi.getValue()).to.equal("aabcxyz@2");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 7, end: 7 });
    });

    it("9. PASTE pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg@12' then add 'xyz' at pos ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@12');
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabcdefg@12");
      rxi.select(4, 10);
      rxi.paste('xyz');
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabcxyz@2");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 7, end: 7 });
    });
    it("10. backspace pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg@12' backspace at characte4 4 ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@12');
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabcdefg@12");
      rxi.select(4, 4);
      rxi.backspace();
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabdefg@12");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 4, end: 4 });
    });
    it("10. backspace and undo pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg@12' backspace at characte4 4 ", function () {
      (0, _chai.expect)(rxi !== undefined).to.be.true;
      rxi.reset();
      ins(rxi, 'bcdefg@12');
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabcdefg@12");
      rxi.select(4, 4);
      rxi.backspace();
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabdefg@12");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 4, end: 4 });
      rxi.undo();
      (0, _chai.expect)(rxi.getValue()).to.deep.equal("aabcdefg@12");
      (0, _chai.expect)(rxi.selection).to.deep.equal({ start: 4, end: 4 });
    });
  });
});