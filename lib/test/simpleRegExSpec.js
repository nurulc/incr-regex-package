"use strict";

var _incrRegexV = require("../incr-regex-v3");

var _utils = require("../utils");

var _rxtree = require("../rxtree");

var _chai = require("chai");

var _rxprint = require("../rxprint");

var regexTokenizer = "(?:\\[(?:\\\\u|\\\\\\]|\\\\\\\\|(\\\\)?\\[|[^\\]\\[\\\\])*?\\])|(?:\\{(?:\\d+,\\d+|" + '\\d+|\\d+,|,\\d+)\\})|(?:\\\\(?:\\.|\\||\\+|\\*|\\?|\\(|\\)|\\^|\\$|d|D|s|S|b|' + 'B|w|W|\\[|\\]|\\{|\\}|\\\\))|(?:\\(\\?:|\\?\\?|\\*\\?|\\+\\?)|(?:\\.|\\||\\+|' + '\\*|\\?|\\(|\\)|\\^|\\$)|(?:[^.+?{}\\]\\[|()\\\\])'; /*
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

function strip(rx) {
  return rx.toString().replace(/^\//, "").replace(/\/g?$/, "");
}
describe("regexp incremental V2", function () {

  describe("simple regexp test V2", function () {
    // Example of use from the test cases
    //
    it("incrRegEx1  /\d{1,3}/", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("\\d{1,3}");
      var res = [r.matchStr('12'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 2, '12'], _rxtree.MAYBE]);
      // r.matchStr('abc') === [true, 2, '12']
      // r.state()         === MORE
    });
    it("incrRegEx1  /\\w{3,4}\\./", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("\\w{3,4}\\.");
      var res = [r.matchStr('Nur'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'Nur'], _rxtree.MORE]); // needs more characters before we are done
      // r.matchStr('abc') === [true, 3, 'Nur']
      // r.state()         === MORE
    });
    it("incrRegEx1  /\\W{3,4}\\d{2,3}/", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("\\W{3,4}\\d{2,3}");
      var res = [r.matchStr('+-%42'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 5, '+-%42'], _rxtree.MAYBE]); // We have enough characters, but we can add more
      (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)('?')); // we have reached the minimum requirement
      // r.matchStr('abc') === [true, 3, 'Nur']
      // r.state()         === MORE
    });
    it("incrRegEx1  /\\W{3,4}\\d{2,3}/", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("\\W{3,4}\\d{2,3}");
      var res = [r.matchStr('+-%'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, '+-%'], _rxtree.MORE]); // We have enough characters, but we can add more
      (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)('?__?')); // we have reached the minimum requirement
      // r.matchStr('abc') === [true, 3, 'Nur']
      // r.state()         === MORE
    });
    it("Test minChars functionality /abd|abd?/ new", function () {
      var r = (0, _incrRegexV.incrRegEx)("abd|abd?");
      (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)('ab?')); // minimal crring that will match the regexp
    });
    it("Test word boundary /\\babc\\b/ new", function () {
      var r = (0, _incrRegexV.incrRegEx)("\\babc\\b");
      var res = [r.matchStr('abc'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'abc'], _rxtree.DONE]);
      (0, _chai.expect)(r.state()).to.deep.equal(_rxtree.DONE);
    });
    it("Test word boundary / \\b / new", function () {
      var r = (0, _incrRegexV.incrRegEx)(" \\b ");
      var res = [r.matchStr('  '), r.state()];
      //console.log("CURRENT", r.current.data[0]);
      (0, _chai.expect)(res).to.deep.equal([[false, 1, ' '], _rxtree.MORE]);
      //expect(r.state()).to.deep.equal(DONE);
    });
    it("Test word boundary / [a-z0-9]{3}\\b / new", function () {
      var r = (0, _incrRegexV.incrRegEx)(" [a-z0-9]{3}\\b ");
      var res = [r.matchStr(' ab1'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 4, ' ab1'], _rxtree.MORE]);
      (0, _chai.expect)(r.match(' ')).to.equal(true);
      (0, _chai.expect)(r.state()).to.deep.equal(_rxtree.DONE);
    });
    it("Test word boundary / [a-z0-9]{3}\\b / new", function () {
      var r = (0, _incrRegexV.incrRegEx)(" [a-z0-9]{3}\\b ");
      var res = [r.matchStr(' abc'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 4, ' abc'], _rxtree.MORE]);
      (0, _chai.expect)(r.match(' ')).to.equal(true);
      (0, _chai.expect)(r.state()).to.deep.equal(_rxtree.DONE);
    });

    it("Test word boundary /\\b(abc\\b|abcd\\b)/ new", function () {
      var r = (0, _incrRegexV.incrRegEx)("\\b(abc\\b|abcd\\b");
      var res = [r.matchStr('abc'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'abc'], _rxtree.MAYBE]);
      (0, _chai.expect)(r.state()).to.deep.equal(_rxtree.MAYBE);
      (0, _chai.expect)(r.match('d')).to.equal(true);
      (0, _chai.expect)(r.state()).to.equal(_rxtree.DONE);
    });
    it("Test word boundary /\\b(abc\\b\\b|abcd\\b\\b)|abx/ new", function () {
      var r = (0, _incrRegexV.incrRegEx)("\\b(abc\\b\\b|abcd\\b\\b)|abx");
      var res = [r.matchStr('abc'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'abc'], _rxtree.MAYBE]);
      (0, _chai.expect)(r.state()).to.deep.equal(_rxtree.MAYBE);
      (0, _chai.expect)(r.match('d')).to.equal(true);
      (0, _chai.expect)(r.state()).to.equal(_rxtree.DONE);
    });
    it("Test word boundary /\\b(abc\\b|abcd\\b.*)/ new", function () {
      var r = (0, _incrRegexV.incrRegEx)("\\b(abc\\b|abcd\\b.*");
      var res = [r.matchStr('abc'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'abc'], _rxtree.MAYBE]);
      (0, _chai.expect)(r.state()).to.deep.equal(_rxtree.MAYBE);
      (0, _chai.expect)(r.match('d')).to.equal(true);
      (0, _chai.expect)(r.state()).to.equal(_rxtree.MAYBE);
    });
    it("incrRegEx test incremental matching => /abc|abd/ ", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("abc|abd");
      var res = [r.match('a'), r.match('b'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([true, true, _rxtree.MORE]);
      //
      // Match some more
      res = [r.match('d'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([true, _rxtree.DONE]);
    });

    it("incrRegEx using its tokenizer ", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("(?:\\[(?:\\\\u|\\\\\\]|\\\\\\\\|(\\\\)?\\[|[^\\]\\[\\\\])*?\\])");
      var res = r.matchStr("[a-z\\\\]");
      //console.log(printExprQ(r.base));
      //expect([res, printExprQ(r.base)]).to.equal([]);

      (0, _chai.expect)(res).to.deep.equal([true, 7, "[a-z\\\\]"]);
    });
  });
});