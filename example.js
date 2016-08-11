var irx = require("incr-regex-package");



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



const incrRegEx= irx.incrRegEx;
const printExpr= irx.printExpr;
const RX= irx.RxParser;
const p = new RX();
const RXInputMask = irx.RXInputMask;
const RxMatcher = irx.RxMatcher;
const DONE = irx.DONE;
const MORE = irx.MORE;
const convertMask = irx.convertMask;

// Lets start simple:

// example match a US phone number
  var rx = incrRegEx( /\d{3}-\d{3}-\d{4}/ );

// we are trying to match '212-409-5123'

// the method to match is: rx.match(char)

  console.log("enter '2' expect true :"+ rx.match('2')); // => true,  matched "2..."
  console.log("enter '-' expect false :"+ rx.match('-')); // => false , i.e. it did not accept the character



  console.log("enter '1' expect true :"+rx.match('1')); // => true ,  matched '21...'
  console.log("enter '2' expect true :"+rx.match('2')); // =>  true   matched '212..'
  console.log("enter '4' expect flase :"+rx.match('4') + " expected char '-'"); // =>  false , expected '-'

  console.log("enter '-' expect true :"+rx.match('-')); // => true , matched '212-...'
  console.log("enter '409-512' : " + rx.matchStr("409-512"));
  console.log("Still need one more char, expect true :"+ (rx.state() === MORE) ); // => true
  console.log("enter '-' expect true :"+rx.match('3')); // => true,  matched '212-409-5123'

  console.log("expect true :"+(rx.state() === DONE)); // true

// ===== so far so good =====

 var rx1 = rx.clone().reset(); // create a copy and put the state back to the begining

// lets look at some interesting stuff - print the regex

console.log(`As rexexp string rep: ${rx1.toString()}`); // print the regular exp
console.log(`Mask: ${rx1.minChars()}  => This is the input mask associated with the regular expression`); // show input mask;

rx1 = incrRegEx(/Yes|No|Maybe/);

// we want to get a list of possible input (simple case)
console.log(`minCharList: [${rx1.minCharsList().toString()}]`); // give a list of patterns you could match
rx1.match('Y');
console.log(`minCharList: [${rx1.minCharsList().toString()}]`); // give a list of patterns you could match after 'Y' was entered

//=== so how do we expoint that functionality ====


var anRx = /aa[a-zA-Z]+@@\d+!!/; // regex.
var funky = new RXInputMask({pattern:anRx}); // 




var emailStr = "[a-zA-Z0-9_.-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]{2,})*(\\.[a-zA-Z0-9_-]{2,8})";
var email = incrRegEx(emailStr);

var emailInput = new RXInputMask({pattern: /aa[a-zA-Z]+@@\d+!!/ });
var rxi = new RXInputMask({pattern: /\+\(\d{3}\)-\d{3}-\d{4}|#\d{3}\.\d{3}X?YZ| ?\d{3}---\d{4}\./ });
var sel = { start: 0, end: 1};
var im = new RXInputMask({pattern: "aa[a-zA-Z]+@\\d+"});


