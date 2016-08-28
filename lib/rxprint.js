// module: rxprint.js
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
exports.printExpr = printExpr;
exports.printExprS = printExprS;
exports.printExprQ = printExprQ;
exports.printExprN = printExprN;

var _rxtree = require("./rxtree");

function printExpr(exp, paren) {
  if (paren && exp && exp.oper) return "(" + printExpr(exp) + ")";
  if (exp && exp.oper) {
    if (exp.oper.type == 'B') {
      if (exp.oper.op == '.') return "(" + printExpr(exp.left) + "." + printExpr(exp.right) + ")";
      return "(" + printExpr(exp.left) + "|" + printExpr(exp.right) + ")";
    } else if (exp.oper.type == 'U') {
      return "(" + printExpr(exp.left, false) + exp.oper.val + ")";
    }
  } else if (exp === _rxtree.DONE) return "<DONE>";else return exp.val;
}

function printExprS(exp, ctxPriority) {
  if (exp && exp.oper) {
    if (exp.oper.type == 'B') {
      if (exp.oper.op == '.') return ctxPriority > 2 ? "(" + printExprS(exp.left, 2) + printExprS(exp.right, 2) + ")" : printExprS(exp.left, 2) + printExprS(exp.right, 2);
      return ctxPriority > 1 ? "(" + printExprS(exp.left, 1) + "|" + printExprS(exp.right, 1) + ")" : printExprS(exp.left, ctxPriority + 1) + "|" + printExprS(exp.right, ctxPriority);
    } else if (exp.oper.type == 'U') {
      return ctxPriority > 3 ? "(" + printExprS(exp.left, 1) + ")" + exp.oper.val : printExprS(exp.left, 3) + exp.oper.val;
    }
  } else if (exp === _rxtree.DONE) return "<DONE>";else return exp.val || '~~~';
}

function printExprQ(exp, paren) {
  if (paren && exp && exp.oper) return "(" + printExprQ(exp) + ")";
  if (exp && exp.oper) {
    if (exp.oper.type == 'B') {
      if (exp.oper.op == '.') return "(" + printExprQ(exp.left) + "." + printExprQ(exp.right) + ")";
      return "(" + printExprQ(exp.left) + "|" + printExprQ(exp.right) + ")";
    } else if (exp.oper.type == 'U') {
      return "(" + printExprQ(exp.left, false) + exp.oper.val + ")";
    }
  } else if (exp === _rxtree.DONE) return "<DONE>";else return "'" + (exp.val || '~~~') + "'";
}

function printExprN(exp, paren) {
  if (paren && exp && exp.oper) return "(" + printExpr(exp) + ")";
  if (exp && exp.oper) {
    if (exp.oper.type == 'B') {
      if (exp.oper.op == '.') {
        if (exp.nextNode) return "(" + printExprN(exp.left) + "." + printExprN(exp.nextNode) + ")";else return printExprN(exp.left);
      }
      return "(" + printExprN(exp.left) + "|" + printExprN(exp.right) + ")";
    } else if (exp.oper.type == 'U') {
      if (exp.nextNode) {
        return "((" + printExpr(exp.left, false) + exp.oper.val + ")." + printExprN(exp.nextNode) + ")";
      }
      return "(" + printExpr(exp.left, false) + exp.oper.val + ")";
    }
  } else if (exp === _rxtree.DONE) return "<DONE>";else {
    if (exp && exp.nextNode) return "(" + (exp.val || '~~~') + "." + printExprN(exp.nextNode) + ")";
    return exp ? exp.val : '';
  }
}