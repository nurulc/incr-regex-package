"use strict";

var _incrRegexV = require("../incr-regex-v3");

var _regexpParser = require("../regexp-parser");

var _chai = require("chai");

describe("regexp incremental New", function () {

  describe("simple regexp test New", function () {
    // Example of use from the test cases
    //
    it("incrRegEx  /abc/", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("abc");
      var res = [r.matchStr('abc'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'abc'], _regexpParser.DONE]);
      // r.matchStr('abc') === [true, 3, abc]
      // r.state()         === DONE
    });
    if (1) {
      (function () {
        var ones = function ones(n) {
          var s = '';
          for (var i = 0; i < n; i++) {
            s = s + '1';
          }return s;
        };

        it("Test minChars functionality /abd|abd?/ new", function () {
          var r = (0, _incrRegexV.incrRegEx)("abd|abd?");
          (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)('ab?')); // minimal crring that will match the regexp
        });
        it("incrRegEx test incremental matching => /abc|abd/ ", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)("abc|abd");
          var res = [r.match('a'), r.match('b'), r.state()];
          (0, _chai.expect)(res).to.deep.equal([true, true, _regexpParser.MORE]);
          //
          // Match some more
          res = [r.match('d'), r.state()];
          (0, _chai.expect)(res).to.deep.equal([true, _regexpParser.DONE]);
        });
        it("incrRegEx or /abc|abdc*/ new", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)("abc|abdc*");
          (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)("ab_"));
        });
        it("incrRegEx or /(abc|abdc*|abx)cat*/ new", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)("(abc|abdc*|abx)cat*");
          (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)("ab_*ca*"));
        });
        it("incrRegEx or /(abc|abdc*|abx)(cat|gat)/ new", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)("(abc|abdc*|abx)(cat|gat)");
          (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)("ab_*_at"));
        });
        it("incrRegEx or (abc|abdc*|abx)(cat|gat) new2", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)("(abc|abdc*|abx)(cat|gat)");
          (0, _chai.expect)(r.matchStr("abc")).to.deep.equal([true, 3, "abc"]); // after matching 'abc'
          (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)("_at")); // the minimum to match _ (some char 'c' or 'g') then 'at')
        });
        it("incrRegEx or abc|abd new", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)("(abc|abdc*|abx)(cat|gat)");
          (0, _chai.expect)(r.matchStr("abc")).to.deep.equal([true, 3, "abc"]);
          (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)("_at"));
        });
        it("incrRegEx or a{3,} - matchStr new", function () {
          var r = (0, _incrRegexV.incrRegEx)("a{3,}");
          var res = [r.matchStr('aaa'), r.state()];
          (0, _chai.expect)(res[0]).to.deep.equal([true, 3, 'aaa']);
          (0, _chai.expect)(r.tracker).to.deep.equal([['a', 'a'], ['a', 'a'], ['a', 'a']]);
          //var res = r.test(undefined);
          //expect( res.data ).to.deep.equal([]);
          //res = r.test(DONE);
          //expect( __isDoneN(res) ).to.equal(true);

          (0, _chai.expect)(r.state()).to.equal(_regexpParser.MAYBE);
          (0, _chai.expect)(res).to.deep.equal([[true, 3, 'aaa'], _regexpParser.MAYBE]);
        });
        it("incrRegEx or a{3,5} - match", function () {
          var r = (0, _incrRegexV.incrRegEx)("a{3,5}");
          (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)("aaa?"));
          var res = [r.match('a'), r.match('a'), r.match('a'), r.match('a'), r.match('a'), r.match('a'), r.state()];
          (0, _chai.expect)(res).to.deep.equal([true, true, true, true, true, false, _regexpParser.DONE]);
        });
        var EMAIL = "[a-zA-Z0-9_.-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]{2,})*(\\.[a-zA-Z0-9_-]{2,8})";
        // let EMAIL = "[a-zA-Z0-9_.-]+(\\.[a-zA-Z0-9_-]{1,})*@[a-zA-Z0-9_-]{1,}(\\.[a-zA-Z0-9_-]{1,})*(\\.[a-zA-Z0-9]{2,8}){1,}";

        it("incrRegEx for email - valid 'nuru1.-.choudhury@ey.com'", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)(EMAIL);
          //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
          var res = [r.matchStr('nuru1.-.choudhury@ey.com'), r.state()];
          //                      12345678901234567890123 
          (0, _chai.expect)(res).to.deep.equal([[true, 24, 'nuru1.-.choudhury@ey.com'], _regexpParser.MAYBE]);
        });
        it("incrRegEx for email - valid 'nuru1.-.choudhury@ey.com'", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)(EMAIL);
          //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
          var res = [r.matchStr('nuru1.-.choudhury@ey.com'), r.state()];
          //                      12345678901234567890123 
          (0, _chai.expect)(res).to.deep.equal([[true, 24, 'nuru1.-.choudhury@ey.com'], _regexpParser.MAYBE]);
        });
        it("incrRegEx for email - invalid 'nurul.t@choudhury.1.2345678901234567890.com' ", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)(EMAIL);
          //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
          var res = [r.matchStr('nurul.t@choudhury.1.2345678901234567890.com'), r.state()];
          //                      12345678901234567890 
          (0, _chai.expect)(res).to.deep.equal([[false, 19, 'nurul.t@choudhury.1'], _regexpParser.MORE]);
          r.reset();
          (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)('_*@_*.__?'));
        });
        it("incrRegEx for email - invalid (extra @) 'nurul.t@choudhury.ab.2345678901234567890@ey.com' ", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)(EMAIL);
          //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
          var res = [r.matchStr('nurul.t@choudhury.ab.2345678901234567890@ey.com'), r.state()];
          //                      12345678901234567890123456789012345678901234567 
          (0, _chai.expect)(res).to.deep.equal([[false, 40, 'nurul.t@choudhury.ab.2345678901234567890'], _regexpParser.MORE]);
        });
        it("incrRegEx for email - incomplete (last name cannot be more than 8 'commander') 'nurul.t@choudhury.ab.2345678901234567890ey.commander' ", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)(EMAIL);
          //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
          var res = [r.matchStr('nurul.t@choudhury.ab.2345678901234567890ey.commander'), r.state()];
          //                      12345678901234567890123456789012345678901234567890123 
          (0, _chai.expect)(res).to.deep.equal([[true, 52, 'nurul.t@choudhury.ab.2345678901234567890ey.commander'], _regexpParser.MORE]);
        });
        it("incrRegEx for email - valid 'nurul.t@choudhury.ab.2345678901234567890ey.commande' ", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)(EMAIL);
          //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
          var res = [r.matchStr('nurul.t@choudhury.ab.2345678901234567890ey.commande'), r.state()];
          //                      12345678901234567890123456789012345678901234567890123 
          (0, _chai.expect)(res).to.deep.equal([[true, 51, 'nurul.t@choudhury.ab.2345678901234567890ey.commande'], _regexpParser.MAYBE]);
        });
        it("incrRegEx for email - valid nurul.choudhury@ey.co.uk", function () {
          (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
          var r = (0, _incrRegexV.incrRegEx)(EMAIL);
          //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
          var res = [r.matchStr('nurul.choudhury@ey.co.uk'), r.state()];
          //                      123456789012345678901234 
          (0, _chai.expect)(res).to.deep.equal([[true, 24, 'nurul.choudhury@ey.co.uk'], _regexpParser.MAYBE]);
        });

        var LEN = 40000;
        var COUNT = 1;
        it("incrRegEx pathalogical case /(1|4|5){0,100}(1|3){99,100}(1|6)*(1|0){38}abc/  against '1' * (40,000) + 'abc'", function () {
          // the results are not great - but does not fail
          var r = (0, _incrRegexV.incrRegEx)("(1|4|5){0,100}(1|3){99,100}(1|6)*(1|0){38}abc");
          // Processes a pathelogical string of 40,000 characters - this is really hard, most regexp fail misserably on this test
          // Incremental regexp processing is really hard, and there is little opportunity for optimization
          // but fortunately it does somehow manage to do this without completely failing
          // I am sure if I worked at it I can improve the performance dramatically, but there really is not need
          // This is not a usecase for the incremental parser and the V8 version does it quite well
          // The code is pure javascript and the V8 engine creates assembly code to do this, so I expect an amazing difference,
          // but it is not as big as I expected
          var data = ones(LEN) + "abc";
          //
          var res;
          for (var k = 0; k < COUNT; k++) {
            r.reset();
            res = [r.matchStr(data), r.state()];
          }

          (0, _chai.expect)(res).to.deep.equal([[true, data.length, data], _regexpParser.DONE]);
          (0, _chai.expect)(r.current.length).to.equal(1); // the number of regexp alternative paths left should be one
          //console.log("MAXLEN", r.maxLen);
        });
        it("regexp pathalogical case /(1|4|5){0,100}(1|3){99,100}(1|6)*(1|0){388}abc/ using Javascript", function () {
          // Javascript I expected this to fail but the resuts are amazing
          // Processes a pathelogical string of 40,000 characters
          // Even the highly optimized machine code generating engine in V8 struggles with this
          // difficult case.
          var r = /(1|4|5){0,100}(1|3){99,100}(1|6)*(1|0){388}abc/;
          var data = ones(LEN) + "abc";
          ;
          var j = 0;
          var x = [];
          for (var k = 0; k < 1 * 100; k++) {
            x[j++] = data.match(r);
            if (j > 10) j = 0;
          }
          //expect(!!data.match(r)).to.deep.equal(true);
        });
      })();
    }
  });

  describe("simple incr regexp", function () {

    it("rationalize abd|abd?", function () {
      var r = (0, _incrRegexV.incrRegEx)("abd|abd?");
      (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)('ab?'));
    });

    it("rationalize abd|abd?", function () {
      var r = (0, _incrRegexV.incrRegEx)("abd|abd?");
      (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)('ab?'));
    });
    it("regexp or abc|abd", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("abc|abd");
      var res = [r.match('a'), r.match('b'), r.match('d'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([true, true, true, _regexpParser.DONE]);
    });
    it("regexp or abc|abdc*", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("abc|abdc*");
      (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)("ab_"));
    });
    it("regexp or abc|abd", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("(abc|abd)c");
      var res = [r.matchStr('abc'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'abc'], _regexpParser.MORE]);
    });
    it("incrRegEx or abc|abd", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("(abc|abd)c?");
      var res = [r.matchStr('abc'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'abc'], _regexpParser.MAYBE]);
    });
    it("incrRegEx or /...\\b\\b../ succeed", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("...\\b\\b..");
      var res = [r.matchStr('   ab'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 5, '   ab'], _regexpParser.DONE]);
    });
    it("incrRegEx or /...\\b../  should fail", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("...\\b..");
      var res = [r.matchStr('  xab'), r.state()];
      (0, _chai.expect)(res[0][0]).to.deep.equal(false);
    });
    it("Javascript /...\\b../ succeed", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = /...\b../;
      var res = r.test('   ab');
      (0, _chai.expect)(res).to.equal(true);
    });
    it("Javascript or /...\\b../  should fail", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = /...\b../;
      var res = r.test('  xab');
      (0, _chai.expect)(res).to.equal(false);
    });
    it("incrRegEx or a{3,} - matchStr", function () {
      var r = (0, _incrRegexV.incrRegEx)("a{3,}");
      var res = [r.matchStr('aaa'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'aaa'], _regexpParser.MAYBE]);
    });
    it("incrRegEx or /me a{3}/ - matchStr", function () {
      var r = (0, _incrRegexV.incrRegEx)("me a{3}");
      var res = [r.matchStr('me aaa'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 6, 'me aaa'], _regexpParser.DONE]);
    });
    it("incrRegEx or /me |a{3}/ - matchStr", function () {
      var r = (0, _incrRegexV.incrRegEx)("me |a{3}");
      var res = [r.matchStr('aa'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 2, 'aa'], _regexpParser.MORE]);

      r.reset();
      res = [r.matchStr('me '), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'me '], _regexpParser.DONE]);

      r.reset();
      res = [r.matchStr('me'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 2, 'me'], _regexpParser.MORE]);
    });
    it("incrRegEx or /(me )|\\w([a-c]{3})?/ - matchStr", function () {
      var r = (0, _incrRegexV.incrRegEx)("(me )|\\w([a-c]{3})?");
      var res = [r.matchStr('xa'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 2, 'xa'], _regexpParser.MORE]);

      r.reset();
      res = [r.matchStr('m'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 1, 'm'], _regexpParser.MAYBE]);

      r.reset();
      res = [r.matchStr('mbac'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 4, 'mbac'], _regexpParser.DONE]);

      r.reset();
      res = [r.matchStr('me '), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 3, 'me '], _regexpParser.DONE]);

      r.reset();
      res = [r.matchStr('me'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, 2, 'me'], _regexpParser.MORE]);
    });
    it("incrRegEx or a{3,5} - matchStr", function () {
      var r = (0, _incrRegexV.incrRegEx)("a{3,5}");
      (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)("aaa?"));
      var res = [r.matchStr('aaaaaa'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[false, 5, 'aaaaa'], _regexpParser.DONE]);
    });
    it("incrRegEx or a{3,} - match", function () {
      var r = (0, _incrRegexV.incrRegEx)("a{3,}");
      var res = [r.match('a'), r.match('a'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([true, true, _regexpParser.MORE]);
    });
    it("incrRegEx or a{3,5} - match check cloning", function () {
      var r1 = (0, _incrRegexV.incrRegEx)("a{3,5}");
      (0, _chai.expect)(r1.minChars()).to.equal((0, _incrRegexV.convertMask)("aaa?"));
      r1.match('a');
      var r = r1.clone();
      var res = [r.match('a'), r.match('a'), r.match('a'), r.match('a'), r.match('a'), r.state()];
      (0, _chai.expect)(res).to.deep.equal([true, true, true, true, false, _regexpParser.DONE]);
      res = [r1.match('a'), r1.match('a'), r1.match('a'), r1.match('a'), r1.match('a'), r1.state()];
      (0, _chai.expect)(res).to.deep.equal([true, true, true, true, false, _regexpParser.DONE]);
    });

    var EMAIL = "[a-zA-Z0-9_.-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]{2,})*(\\.[a-zA-Z0-9_-]{2,8})";
    it("incrRegEx for email - valid 'nuru1.-.choudhury@ey.com'", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)(EMAIL);
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('nuru1.-.choudhury@ey.com'), r.state()];
      //                      123456789012345678901234
      (0, _chai.expect)(res).to.deep.equal([[true, 24, 'nuru1.-.choudhury@ey.com'], _regexpParser.MAYBE]);
    });
    it("incrRegEx for email - invalid 'nurul.t@choudhury.1.2345678901234567890.com' ", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)(EMAIL);
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('nurul.t@choudhury.1.2345678901234567890.com'), r.state()];
      //                      12345678901234567890 
      (0, _chai.expect)(res).to.deep.equal([[false, 19, 'nurul.t@choudhury.1'], _regexpParser.MORE]);
      r.reset();
      (0, _chai.expect)(r.minChars()).to.equal((0, _incrRegexV.convertMask)("_*@_*.__?"));
    });
    it("incrRegEx for email - invalid (extra @) 'nurul.t@choudhury.ab.2345678901234567890@ey.com' ", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)(EMAIL);
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('nurul.t@choudhury.ab.2345678901234567890@ey.com'), r.state()];
      //                      12345678901234567890123456789012345678901234567 
      (0, _chai.expect)(res).to.deep.equal([[false, 40, 'nurul.t@choudhury.ab.2345678901234567890'], _regexpParser.MORE]);
    });
    it("incrRegEx for email - incomplete (last name cannot be more than 8 'commander') 'nurul.t@choudhury.ab.2345678901234567890ey.commander' ", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)(EMAIL);
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('nurul.t@choudhury.ab.2345678901234567890ey.commander'), r.state()];
      //                      12345678901234567890123456789012345678901234567890123 
      (0, _chai.expect)(res).to.deep.equal([[true, 52, 'nurul.t@choudhury.ab.2345678901234567890ey.commander'], _regexpParser.MORE]);
    });
    it("incrRegEx for email - valid 'nurul.t@choudhury.ab.2345678901234567890ey.commande' ", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)(EMAIL);
      var str = 'nurul.t@choudhury.ab.2345678901234567890ey.commande';
      var res = [r.matchStr(str), r.state()];
      (0, _chai.expect)(res).to.deep.equal([[true, str.length, str], _regexpParser.MAYBE]);
    });
    it("incrRegEx for email - valid", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)(EMAIL);
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('nurul.choudhury@ey.co.uk'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, 24, 'nurul.choudhury@ey.co.uk'], _regexpParser.MAYBE]);
    });
    it("incrRegEx for /a(to |be )+done/", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to |be )+done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('ato be to be be done'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, 'ato be to be be done'.length, 'ato be to be be done'], _regexpParser.DONE]);
    });
    it("incrRegEx for /a(to |be )+done/ - success match only 1", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to |be )+done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('ato done'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, 'ato done'.length, 'ato done'], _regexpParser.DONE]);
    });
    it("incrRegEx for /a(to |be )+done/ - success match only 1", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to |be )+done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('aone'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[false, 'a'.length, 'a'], _regexpParser.MORE]);
    });
    it("incrRegEx for /a(to |be )*done/ - success match only 1", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to |be )*done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('ato done'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, 'ato done'.length, 'ato done'], _regexpParser.DONE]);
    });
    it("incrRegEx for /a(to |be )*done/ - success match only 0", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to |be )*done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('adone'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, 'adone'.length, 'adone'], _regexpParser.DONE]);
    });
    it("incrRegEx for /a((to|TO) |(be|BE) ){4,6}done/ success match 5", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a((to|TO) |(be|BE) ){4,6}done");
      var str = 'ato be TO be be done';
      var res = [r.matchStr(str), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, str.length, str], _regexpParser.DONE]);
    });
    it("incrRegEx for /a((to|TO) |(be|BE) ){4,6}done/ success match 5", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a((to|TO) |(be|BE) ){4,6}done");
      var str = 'ato be to BE be done';
      var res = [r.matchStr(str), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, str.length, str], _regexpParser.DONE]);
    });
    it("incrRegEx for /a(to |be ){4,6}done/ - fail match 3 (to |be )", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to |be ){4,6}done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('ato be to d'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[false, 'ato be to '.length, 'ato be to '], _regexpParser.MORE]);
    });
    it("incrRegEx for /a(to |be ){4,5}done/ success - exact count maatched", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to |be ){4,5}done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('ato be to be be done'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, 'ato be to be be done'.length, 'ato be to be be done'], _regexpParser.DONE]);
    });
    it("incrRegEx for /a(to |be ){4,5}done/ should fail - too many", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to |be ){4,5}done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('ato be to be be be d'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[false, 'ato be to be be '.length, 'ato be to be be '], _regexpParser.MORE]);
    });
    it("incrRegEx for /a(to |be ){4,5}done/ should fail - too many", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = /a(to |){4,5}done/;
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      (0, _chai.expect)(!!r).to.equal(true);
    });
    it("incrRegEx for /a(to |){4,5}done/ should fail - too few", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to |){4,5}done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('ato to to d'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, 'ato to to d'.length, 'ato to to d'], _regexpParser.MORE]);
    });
    it("incrRegEx for /a(|to ){4,5}done/ should fail - too few", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to |){4,5}done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('ato to to d'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, 'ato to to d'.length, 'ato to to d'], _regexpParser.MORE]);
    });
    it("incrRegEx for /a(to ||be ){4,5}done/ should fail - too few", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("a(to ||be ){1,5}done");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [r.matchStr('ato done'), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, 'ato done'.length, 'ato done'], _regexpParser.MAYBE]);
    });
    it("incrRegEx for /|to ||be/ success", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("|to ||be ");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var res = [true, r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([true, _regexpParser.MAYBE]);
    }); //\u0000-~‿-⁀⁔︳-︴﹍-﹏＿
    it("incrRegEx for /[\u0000-~‿-⁀⁔︳-︴﹍-﹏＿꜠]+꜠\\.co\\.uk/ - valid", function () {
      (0, _chai.expect)(_incrRegexV.incrRegEx !== undefined).to.be.true;
      var r = (0, _incrRegexV.incrRegEx)("[\\u0000-~‿-⁀⁔︳-︴﹍-﹏＿꜠]+꜠\\.co\\.uk");
      //var res = [ r.matchStr('nurul.choudhury@ey.c') , r.state() ];
      var S = 'nurul.‿houd⁀⁔︳hur︴﹍y﹏＿@ey.co.ukxyz꜠.co.uk';
      var res = [r.matchStr(S), r.state()];
      //                      123456789012345678901234 
      (0, _chai.expect)(res).to.deep.equal([[true, S.length, S], _regexpParser.MAYBE]);
    });
  });
}); /*
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