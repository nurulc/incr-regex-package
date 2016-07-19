"use strict";

var _utils = require("../utils");

var _chai = require("chai");

//import {describe} from "mocha";

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

var AL = _utils.arrayToList;
var LA = _utils.listToArray;

describe("regex tests", function () {
   var comp = ['^', 't', 'o', '\\(', '(', '[^1-5az]', '|', '[^\\]12]', ')', '\\d', ')', '$'];
   var compStr = comp.join('');

   describe("tokenizer a regexp - '" + compStr + "'", function () {
      it("tokenizes regexp", function () {
         var list = compStr.match(_utils.TOKINIZATION_RX);
         (0, _chai.expect)(list).to.deep.equal(comp);
      });
   });
});

describe("list naumpulation", function () {
   describe("n_cons, n_head, n_tail, n_append, n_filter, listToArray, arrayToList", function () {
      it("construct a single item", function () {
         var result = (0, _utils.n_cons)('a', null);
         (0, _chai.expect)((0, _utils.n_head)(result)).to.equal('a');
         (0, _chai.expect)(result).to.have.a.property("head", 'a');
         (0, _chai.expect)(result).to.have.a.property("tail", null);
      });

      it("construct a composite list", function () {
         var rest = (0, _utils.n_cons)('b', null);
         var result = (0, _utils.n_cons)('a1', rest);
         (0, _chai.expect)((0, _utils.n_head)(result)).to.equal('a1');
         (0, _chai.expect)((0, _utils.n_tail)(result)).to.equal(rest);
         (0, _chai.expect)(result).to.have.a.property("head", 'a1');
         (0, _chai.expect)(result).to.have.a.property("tail", rest);
      });
      it("construct a long list", function () {
         var ix = function ix(list, i) {
            return i === 0 ? (0, _utils.n_head)(list) : ix((0, _utils.n_tail)(list), i - 1);
         };
         var res = "a,b,c,d".split(",").reduce(function (a, b) {
            return (0, _utils.n_cons)(b, a);
         }, null);
         (0, _chai.expect)(ix(res, 0)).to.equal('d');
         (0, _chai.expect)(ix(res, 1)).to.equal('c');
         (0, _chai.expect)(ix(res, 2)).to.equal('b');
         (0, _chai.expect)(ix(res, 3)).to.equal('a');
         //expect(listToArray(res)).to.deep.equal(['d','c','b','a']);
         //expect(listToArray(n_reverse(res)).to.deep.equal("a,b,c,d".split(","));
      });
      it("array operations on list", function () {
         var res = "a,b,c,d".split(",").reduce(function (a, b) {
            return (0, _utils.n_cons)(b, a);
         }, null);
         (0, _chai.expect)(LA(res)).to.deep.equal(['d', 'c', 'b', 'a']);
         (0, _chai.expect)(LA((0, _utils.n_reverse)(res))).to.deep.equal("a,b,c,d".split(","));
      });

      it("filter a list - using odd", function () {
         var res = AL([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
         (0, _chai.expect)(LA((0, _utils.n_filter)(res, _utils.odd))).to.deep.equal([1, 3, 5, 7, 9]);
      });
      it("concat list", function () {
         var first = AL([1, 2, 3]);
         var second = AL([4, 5, 6, 7, 8, 9, 10]);
         (0, _chai.expect)(LA((0, _utils.n_concat)(first, second))).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      });
   });
   describe("n_reduce, n_removeall", function () {
      var list1_to_5 = AL([1, 2, 3, 4, 5]);

      it("n_reduce", function () {

         var res = (0, _utils.n_reduce)(list1_to_5, function (a, b) {
            return a + b;
         }, 0);
         (0, _chai.expect)(res).to.equal(15);
         (0, _chai.expect)((0, _utils.n_reduce)(list1_to_5, function (a, b) {
            return a + b;
         }, "")).to.equal("12345");
      });

      it("n_removeAll", function () {
         var r3_4 = AL([3, 4]);
         var r3_4_5 = AL([3, 4, 5]);
         var empty = null;

         (0, _chai.expect)(LA((0, _utils.n_removeAll)(list1_to_5, r3_4))).to.deep.equal([1, 2, 5]);
         (0, _chai.expect)(LA((0, _utils.n_removeAll)(list1_to_5, r3_4_5))).to.deep.equal([1, 2]);
      });
      it("n_removeAll - all, and empty", function () {
         var empty = null;
         (0, _chai.expect)((0, _utils.listToArray)((0, _utils.n_removeAll)(list1_to_5, empty))).to.deep.equal((0, _utils.listToArray)(list1_to_5));
         (0, _chai.expect)((0, _utils.n_removeAll)(list1_to_5, list1_to_5)).to.equal(null);
      });
   });
});

describe("Stack Opertations", function () {
   var result = "1 2 3 4 5 6".split(" ").map(function (e) {
      return Number(e);
   });
   var s = new _utils.StackDedup();
   var stack = function stack(result) {
      return result.reduce(function (s, e) {
         return s.push(e);
      }, new _utils.StackDedup());
   };
   describe("create a stack", function () {
      it("create a list from a stack", function () {
         (0, _chai.expect)(result).to.deep.equal([1, 2, 3, 4, 5, 6]);
         s = stack(result);
         (0, _chai.expect)(s.data[0]).to.equal(1);
         (0, _chai.expect)(s.data[5]).to.equal(6);

         (0, _chai.expect)(s.data).to.deep.equal([1, 2, 3, 4, 5, 6]);
         (0, _chai.expect)(s).to.have.a.property("length", 6);
         s.push(6);
         (0, _chai.expect)(s.data).to.deep.equal([1, 2, 3, 4, 5, 6]);
         (0, _chai.expect)(s).to.have.a.property("length", 6);
      });

      it("initialize StackDedup", function () {
         s = new _utils.StackDedup(1);

         (0, _chai.expect)(s.data[0]).to.equal(1);
         var sum = s.reduce(function (s, v) {
            return s + v;
         }, 0);
         (0, _chai.expect)(sum).to.deep.equal(1);
      });

      it("map StackDedup", function () {
         s = stack(result);

         (0, _chai.expect)(s.data[0]).to.equal(1);
         var sum = s.reduce(function (s, v) {
            return s + v;
         }, 0);
         (0, _chai.expect)(sum).to.deep.equal(21);
      });
      it("convert to array", function () {
         var s2 = stack(result).filter(function (x) {
            return x % 2 == 0;
         });
         (0, _chai.expect)(s2.toArray()).to.deep.equal([2, 4, 6]);
      });
   });

   describe("n_reduce, n_removeall", function () {
      var list1_to_5 = AL([1, 2, 3, 4, 5]);

      it("n_reduce", function () {

         var res = (0, _utils.n_reduce)(list1_to_5, function (a, b) {
            return a + b;
         }, 0);
         (0, _chai.expect)(res).to.equal(15);
         (0, _chai.expect)((0, _utils.n_reduce)(list1_to_5, function (a, b) {
            return a + b;
         }, "")).to.equal("12345");
      });

      it("n_removeAll", function () {
         var r3_4 = AL([3, 4]);
         var r3_4_5 = AL([3, 4, 5]);
         var empty = null;

         (0, _chai.expect)(LA((0, _utils.n_removeAll)(list1_to_5, r3_4))).to.deep.equal([1, 2, 5]);
         (0, _chai.expect)(LA((0, _utils.n_removeAll)(list1_to_5, r3_4_5))).to.deep.equal([1, 2]);
      });
      it("n_removeAll - all, and empty", function () {
         var empty = null;
         (0, _chai.expect)((0, _utils.listToArray)((0, _utils.n_removeAll)(list1_to_5, empty))).to.deep.equal((0, _utils.listToArray)(list1_to_5));
         (0, _chai.expect)((0, _utils.n_removeAll)(list1_to_5, list1_to_5)).to.equal(null);
      });
   });
});