"use strict";
const repl = require('repl');
var msg = 'message';
var rx = require("./lib/index");
var utils = require("./lib/utils");

//Create node repl
var c = repl.start('> ').context;


// Exports the following:

// incrRegEx - utility function to parse a regular expression an (combines RxParser, and IREGEX), 
//             instance of an incremental matcher IREGEX;
//  
//   Matching Status
//   ---------------
// DONE - regexp is done matching, it will match no further charactes
// MORE - Regex is not yet done, (so far so good) but requires more characters
// MAYBE - Maybe DONE, match is complete but will accept more characters, 
//         e.g. /abc[0-9]{1,4}/
//         after you enter 'ab1' will return MAYBE status,
//         after you enter 'ab15678' will return DONE 
// FAILED - the last char(s) entered are not allowed
//
// RXInputMask - utility class that provides support for providing 
//               support to an html input element support as you type regex checking (and a whole lot more)
//               see npm project (react-maskinput)
// RxParser - parse a Regular Expression (this is a utility class)
// IREGEX   - class that matches a regular expression
//
// Utilities
// ---------
// printExpr,
// matchable,dot,or,zero_or_one,zero_or_more - utilities to walk the regex tree structure
// isMeta, isOptional,isHolder - utilities used by RXInputMask
// contract - general contracts checking see: https://github.com/metaweta/jscategory/blob/master/jscategory.js 
// convertMask - utility to convert 'mask' meta-cheracters to ascii characters 



// Add names to the repl context
//  rx, incrRegEx, printExpr, p, RXInputMast
//
// Note: c = repl context
c.rx = rx;// 
c.help = function(containsStr) {
  var s = "";
  var v;
  for(v in c) {
    if( containsStr && v.toLowerCase().indexOf(containsStr) < 0) continue;
    s += v + " "
  }
  console.log("avaliable variables: "+ s);
}

c.StackDedup = utils.StackDedup;
c.utils = utils;
c.RX= c.rx.RxParser;
c.p = new c.RX();
c.RXInputMask = c.rx.RXInputMask;
c.RxMatcher = c.rx.RxMatcher;

c.MANY = rx.MANY; c.TERM = rx.TERM; c.PERHAPS_MORE = rx.PERHAPS_MORE; c.BOUNDARY = rx.BOUNDARY; c.matchable = rx.matchable;
c.boundary = rx.boundary; c.dot = rx.dot; c.or = rx.or; c.zero_or_one = rx.zero_or_one; c.zero_or_more = rx.zero_or_more;
c.anychar = rx.anychar; c.charset = rx.charset; c.OP = rx.OP; c.SKIP = rx.SKIP; c.BS = rx.BS; c.LP = rx.LP; c.RP = rx.RP;
c.OR = rx.OR; c.ZERO_OR_ONE = rx.ZERO_OR_ONE; c.ZERO_OR_MORE = rx.ZERO_OR_MORE; c.ONE_OR_MORE = rx.ONE_OR_MORE; c.DOT = rx.DOT;
c.FALSE = rx.FALSE; c.DONE = rx.DONE; c.MAYBE = rx.MAYBE; c.MORE = rx.MORE; c.FAILED = rx.FAILED; c.RX_OP = rx.RX_OP;
c.RX_UNARY = rx.RX_UNARY; c.RX_CONS = rx.RX_CONS; c.RX_OR = rx.RX_OR; c.RX_ZERO_OR_ONE = rx.RX_ZERO_OR_ONE; 
c.RX_ZERO_OR_MORE = rx.RX_ZERO_OR_MORE; c.RX_ONE_OR_MORE = rx.RX_ONE_OR_MORE; c.copyNode = rx.copyNode; c.stdRxMeta = rx.stdRxMeta;
c.makeCharSet = rx.makeCharSet; c.makeFSM = rx.makeFSM; c.rxMatchArr = rx.rxMatchArr; c.rxNextState = rx.rxNextState;
c.rxMatch = rx.rxMatch; c.rxCanReach = rx.rxCanReach; c.rxGetActualStartState = rx.rxGetActualStartState; 
c.advancedRxMatcher = rx.advancedRxMatcher; c.incrRegEx = rx.incrRegEx; c.printExpr = rx.printExpr; c.printExprS = rx.printExprS;
c.RxParser = rx.RxParser; c.RXInputMask = rx.RXInputMask; c.contract = rx.contract; c.RxMatcher = rx.RxMatcher;
c.matchable = rx.matchable; c.dot = rx.dot; c.or = rx.or; c.zero_or_one = rx.zero_or_one; c.zero_or_more = rx.zero_or_more;
c.IREGEX = rx.IREGEX; c.convertMask = rx.convertMask; c.isMeta = rx.isMeta; c.isOptional = rx.isOptional; c.isHolder = rx.isHolder;

 c.insx = function (rxi) {  
    return function(str) {
             for(var i=0; i<str.length; i++) {
              rxi.input(str.charAt(i));
             }
          };
  };

c.emailStr = "Mail: [a-zA-Z0-9_.-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]{2,})*(\\.[a-zA-Z0-9_-]{2,8})|ssn: \\d{3}-\\d{2}-\\d{4}|Phone: (\\+\\d{1,3})? \\(\\d{3}\\)-\\d{3}-\\d{4}";
c.email = c.incrRegEx(c.emailStr);

c.anRx = c.incrRegEx(/aa[a-zA-Z]+@@\d+!!/); // create an incremental matcher for regex.

c.funky = new c.RxMatcher(c.anRx); // create a matcher fron an existing matcher


c.rxi1 = new c.RXInputMask({pattern: /aa[a-zA-Z]+@@\d+!!/ });
c.rxi = new c.RXInputMask({pattern: /\+\(\d{3}\)-\d{3}-\d{4}|#\d{3}\.\d{3}X?YZ| ?\d{3}---\d{4}\./ });
c.sel = { start: 0, end: 1};
c.im = new c.RXInputMask({pattern: "aa[a-zA-Z]+@\\d+"});
function st(arr) { return arr.map(c.printExpr).toArray().join("\n"); }
function ot(iRx) {
  return iRx.current === iRx.one? iRx.two : iRx.one;
}
function pr(iRx) {
  return ["match: [" + st(iRx.current)+"]\n",
          "prev: [" + st(ot(iRx))+"]\n",
      iRx.tracker.map(a => '<'+a[0]+'>').join("")];
}
c.st = st;
c.ot = ot;
c.pr =pr;
c.x = c.incrRegEx(/...\b\b../);
[ c.x.matchStr("   ab"), c.x.state()]