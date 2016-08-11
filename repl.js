"use strict";
const repl = require('repl');
var msg = 'message';
var rx = require("./lib/index");

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
c.incrRegEx= c.rx.incrRegEx;
c.printExpr= c.rx.printExpr;
c.RX= c.rx.RxParser;
c.p = new c.RX();
c.RXInputMask = c.rx.RXInputMask;
c.RxMatcher = c.rx.RxMatcher;

 c.insx = function (rxi) {  
    return function(str) {
             for(var i=0; i<str.length; i++) {
              rxi.input(str.charAt(i));
             }
          };
  };

c.emailStr = "[a-zA-Z0-9_.-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]{2,})*(\\.[a-zA-Z0-9_-]{2,8})";
c.email = c.incrRegEx(c.emailStr);

c.anRx = c.incrRegEx(/aa[a-zA-Z]+@@\d+!!/); // create an incremental matcher for regex.

c.funky = new c.RxMatcher(c.anRx); // create a matcher fron an existing matcher


c.rxi1 = new c.RXInputMask({pattern: /aa[a-zA-Z]+@@\d+!!/ });
c.rxi = new c.RXInputMask({pattern: /\+\(\d{3}\)-\d{3}-\d{4}|#\d{3}\.\d{3}X?YZ| ?\d{3}---\d{4}\./ });
c.sel = { start: 0, end: 1};
c.im = new c.RXInputMask({pattern: "aa[a-zA-Z]+@\\d+"});
