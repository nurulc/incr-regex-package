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

*/"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.RxParser=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _utils=require("./utils");var _rxprint=require("./rxprint");var _rxtree=require("./rxtree");function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}if(!_utils.array_append){throw new Error("array_append is undefined");}function isMulti(op){return op&&op.type=='U'&&op.op=='MULTIRANGE';}// Matching function
// =================
/*function __matchX(regexp) {
  return function(ch) { return [ch !== DONE && (ch === undefined || ch.match(regexp)), undefined]; };
}

function anychX(ch) { return [ch !== DONE, undefined]; }
function __matchcX(c) {
  return function(ch) { return [(ch !== DONE) && (ch === undefined || ch == c), c]; };
}


//function anych(ch) { return [ch !== DONE, undefined]; }
*/var MATCH_FALSE=[false,undefined];var MATCH_TRUE=[true,undefined];function __matchc(c){return function(ch){return!!(ch!==_rxtree.DONE&&(ch===undefined||ch===c))?[true,c]:MATCH_FALSE;};}function isNotAlnum(ch){return!/\w|\d/.test(ch||'.');}function isNotAlpha(ch){return!/\w/.test(ch||'.');}function endofstr(prev,ch){var l=!prev||isNotAlnum(prev);var r=isNotAlnum(ch);return l&&!r||!l&&r?MATCH_TRUE:MATCH_FALSE;}//Match begining of string -- This is not suppoorted
function begining(){return false;}//==========================
/*

Convert a RegExp parse tree to a finite state machine (FSM)

  so given a subtree 't' and a connector (next state)
  set the 'nextNode' to the connector

cases of t:
    t - simple match =>  t.nextNode = connector  (shortened to t -> connector )
      - A . B        =>  A -> B -> connector
      - A*           =>  A -> t -> connector
      - A | B        =>  A -> connector, B -> connector
      - A ?          =>  t -> connector, A -> connector
*///matchable,dot,or,zero_or_one,zero_or_more
var _metaMap={"*":_rxtree.ZERO_OR_MORE,"+":_rxtree.ONE_OR_MORE,"?":_rxtree.ZERO_OR_ONE};var _stdRegexp={"\\d":/\d/,"\\D":/\D/,"\\s":/\s/,"\\S":/\S/,"\\w":/\w/,"\\W":/\W/};var chmap={'t':"\t",'n':"\n",'r':"\r"};function logit(msg,val){console.log("logit: "+msg);return val;}function convert(str){if(str=='<SKIP>')return _rxtree.SKIP;if(str=='('||str=='(?:')return _rxtree.LP;if(str==')')return _rxtree.RP;if(str=='.')return(0,_rxtree.ANYCH)();if(str=='[\\b]')return _rxtree.BS;if(str=='^'||str=='$')return{type:'N',val:str,multi:_rxtree.BOUNDARY,op:'BOUNDARY',match:begining};if(str=='\\b'||str=='\\B')return{type:'N',val:str,multi:_rxtree.BOUNDARY,op:'BOUNDARY',match:endofstr};if(/^\[.*\]$/.test(str))return(0,_rxtree.makeCharSet)(str);//{type: 'N', val: str,  multi: MANY,     op: 'CHARSET', match: __match(new RegExp(str))};
if(str=='|')return _rxtree.OR;if(/^[?+*]\??$/.test(str))return _metaMap[str.substring(0,1)];if(/^\{[^}]*\}$/.test(str))return{type:'U',val:str,op:'MULTIRANGE',fn:(0,_utils.parseMulti)(str)};if(/^\\[dDsSwW]$/.test(str))return(0,_rxtree.stdRxMeta)(str);//{type: 'N', val: str, multi: MANY, op: 'SPECIAL-CHARSET',match: __match(_stdRegexp[str])};
if(/^\\[trn]$/.test(str))return{type:'N',val:chmap[str.substring(1,2)],multi:_rxtree.TERM,op:'NON-PRINTING',match:__match("\\"+str.substring(1))};if(/^\\[.?+*{}()$^\\:|\][]$/.test(str))return{type:'N',val:str.substring(1,2),multi:_rxtree.TERM,op:'SINGLE',match:__matchc(str.substring(1))};return{type:'N',val:str,multi:_rxtree.TERM,op:'SINGLE',match:__matchc(str)};}/*
export function clearNodeMarkers(aNode) {
  if( aNode === undefined ) return undefined;
  if( aNode === DONE ) { DONE.marker = 0; return DONE; }
  //if( aNode.type === 'U' ) return {type: 'U', val: aNode.val, op: aNode.op, match: aNode.match};
  if( aNode.type === 'N' && aNode.oper === undefined ) { aNode.marker = 0; }
  else {
    clearNodeMarkers(aNode.right);
    clearNodeMarkers(aNode.left);

  }
  aNode.marker = 0;
}
*/// =============
// Parser helpers
//
// Helper function for Precedence
// odd values are left associative and even value aare right associative
// e.g.   '.' opererator 
//     a . b . c =>  a . (b . c)   RIGHT ASSOCIATIVE
//     a . b . c => (a . b) . c    LEFT  ASSOCIATIVE
//
// for the efficient evaluation of regular expressions
// right associative is more efficient to evaluate
//
// Note the unary operators ( ? * + ) must be left associative
//
//    a+*   =>  (a+)*
//
// a is higher precedence true
// a == b 
function gtPrec(a,b){if(a<b)return false;if(a>b)return true;return(0,_utils.odd)(a);}var mapper=[{match:["(","|",")"],put:["(",")"]},{match:["<SKIP>","|","<SKIP>"],put:["<SKIP>"]},{match:["<SKIP>","<SKIP>"],put:["<SKIP>"]},{match:["(","<SKIP>",")"],put:["<SKIP>"]},{match:["<SKIP>","*"],put:["<SKIP>"]},{match:["<SKIP>","+"],put:["<SKIP>"]},{match:["(","|"],put:["(","<SKIP>","|"]},{match:["|",")"],put:["|","<SKIP>",")"]},{match:["|","|"],put:["|","<SKIP>","|"]},{match:["(",")"],put:["<SKIP>"]}];// Match an item in the mapper table against the tokenList at position ix
// Note = is the mathematical concept of equality and not an assignment
//
// let m = mapper[i].match ; // for some i
// let tokenList = prefixArray + m + rest ; // + means array concatination
// let ix = prefixArray.length; 
// then
//    matchMapper(tokenList,ix) = m
function matchMapper(tokenList,ix){for(var i=0;i<mapper.length;i++){if((0,_utils.array_match)(tokenList,mapper[i].match,ix))return mapper[i];}return undefined;}// Note = is the mathematical concept of equality and not an assignment
// if no 'i' exists where matchMapper(tokenList,i) has a value 
//  then updateTokens(list) = list
//  else
//    for smallest ix
//    let map = matchMapper(pre + m + post,ix)
//    then
//       updateTokens(pre + m + post) = pre + map + updateTokens(post)
function updateTokens(tokenList){var res=[];for(var i=0,l=tokenList.length;i<l;i++){var mapV=matchMapper(tokenList,i);if(mapV){(0,_utils.array_append)(res,mapV.put);i+=mapV.match.length-1;}else res.push(tokenList[i]);}return res;}/*
  Simple operator precedence grammar has problems with some accepable regular expression 

  examples:
     /|abc.../    - expression cannot start with a binary operator, change to /<SKIP>|abc.../
     /...(|)...)- expression cannot start with a binary operator, change to /...<SKIP>.../
     /...(|abc...)- expression cannot start with a binary operator, change to /...(<SKIP>|abc.../
     /...(xyz||abc...)- expression cannot start with a binary operator, change to /...(xyz|<SKIP>|abc.../
     /...abc|)...)- expression cannot start with a binary operator, change to /...abc|<SKIP>).../
     /...()...)- expression cannot start with a binary operator, change to /...<SKIP>.../
     /...(<SKIP>)...)- reduce the complexityof skip instruction to allow further optimization, change to /...<SKIP>.../
     /...<SKIP>*...)- optimize zero or more skips to a single skip, change to /...<SKIP>.../
     /...<SKIP>+...)- optimize repeated skip, change to /...<SKIP>.../
     /...<SKIP><SKIP>...)- optimized repeated skip, change to /...<SKIP>.../



*/function fixTokens(tokenList){if(tokenList){if(tokenList[tokenList.length-1]=="|")tokenList=tokenList.concat("<SKIP>");if(tokenList[0]=="|")tokenList=["<SKIP>"].concat(tokenList);}var newList=updateTokens(tokenList);while(!(0,_utils.array_eq)(tokenList,newList)){tokenList=newList;newList=updateTokens(tokenList);}return tokenList;}function isRegExp(s){return s instanceof RegExp;}// Actual parser
/*

 This is a parser for regular expressions, it uses a simple operator precidence parser
 It uses a regular expression as the tokenizer (TOKINIZATION_RX)


*/var RxParser=exports.RxParser=function(){function RxParser(){_classCallCheck(this,RxParser);this.operand=[];this.operator=[];this.basePrec=0;this.wasOp=true;this.lastop=undefined;}_createClass(RxParser,[{key:"toString",value:function toString(){return"{ operand: "+this.operand.map(_rxprint.printExpr)+" operator: "+this.operator.map(function(e){return e.toString();})+" prec: "+this.BasePrec+" wasOp: "+this.wasOp+"}";}},{key:"opState",value:function opState(from,to,op){var tp=function tp(x){return x?"OPERATOR":"OPERAND";};this.lastop=op;if(this.wasOp!=from){throw new Error("RegExp parsing expected: "+tp(from)+" but was: "+tp(this.wasOp));}this.wasOp=to;}},{key:"addToken",value:function addToken(a){if(!a)return this.finishUp();var c=convert(a);//console.log(c);
if((c.type=='N'||c.type=='L')&&!this.wasOp){this.pushOp(_rxtree.DOT,this.basePrec+4);this.opState(false,true);}switch(c.type){case'L':this.opState(true,true,_rxtree.LP);this.basePrec+=10;break;case'R':this.opState(false,false,_rxtree.RP);this.basePrec-=10;if(this.basePrec<0)throw Error("Syntax error "+this.basePrec);break;case'':case'B':this.pushOp(c,this.basePrec+2);this.opState(false,true,c);break;case'U':this.pushOp(c,this.basePrec+7);this.opState(false,false,c);break;case'N':this.operand.push(c);this.opState(true,false,c);break;default:throw Error("Syntax error - in regexp");}return this;}},{key:"pushOp",value:function pushOp(op,prec){var t=this.topV()||{prec:-100};//console.log("top",prec, op, t);
while(t&&gtPrec(t.prec,prec)){var a,b;b=this.popOper();if(!t.op.type||t.op.type==='B'){a=this.popOper();//console.log("pushOp",{ op: t.op, left: a, right: b });
this.operand.push((0,_rxtree.RX_OP)(t.op,a,b));}else{if(isMulti(t.op)){this.operand.push(this.applyMulti(t.op,b));}else if(t.op===_rxtree.ONE_OR_MORE/*t.op.val == "+" */){this.oneOrMore(b);//this.operand.push({oper: DOT, left: b, right:{ oper: ZERO_OR_MORE, left: b}});
}else{this.unaryOp(t.op,b);}//this.operand.push({ oper: t.op, left: b}); }
//console.log("pushOp",{ oper: t.op, left: a, right: b });
}this.operator.pop();t=this.topV();}if(prec>=0)this.operator.push({op:op,prec:prec});}},{key:"finishUp",value:function finishUp(){if(this.wasOp===undefined)return this;if(!this.wasOp){this.pushOp(_rxtree.DOT,0);this.operand.push(_rxtree.DONE);this.pushOp(undefined,-1);}else this.pushOp(undefined,-1);this.wasOp=undefined;return this;}},{key:"val",value:function val(){return this.operand.length===0?undefined:this.operand[this.operand.length-1];}},{key:"topV",value:function topV(){return this.operator.length===0?undefined:this.operator[this.operator.length-1];}},{key:"popOper",value:function popOper(){return this.operand.pop();}},{key:"applyMulti",value:function applyMulti(op,b){var min=op.fn.min;var max=op.fn.max;var i;if((0,_rxtree.boundary)(b))throw new SyntaxError("repetition of boundary element: '"+b.val+"'' has no meaning");var applyIt=function applyIt(p,b,max){if(max===0)return p;for(i=0;i<max;i++){b=(0,_rxtree.copyNode)(b);p=p?(0,_rxtree.RX_CONS)(p,b):b;}return p||b;};// 0 or more
if(min===0){if(max===undefined)return(0,_rxtree.RX_ZERO_OR_MORE)(b);//{ oper: ZERO_OR_MORE, left: b};
else return applyIt(undefined,(0,_rxtree.RX_ZERO_OR_ONE)(b)/*{ oper: ZERO_OR_ONE, left: b}*/,max);}else if(max===undefined){// 1 or more
return applyIt(applyIt(undefined,b,min),(0,_rxtree.RX_ZERO_OR_MORE)(b)/*{ oper: ZERO_OR_MORE, left: b}*/,1);}// min and max are present
return applyIt(applyIt(b,b,min-1),(0,_rxtree.RX_ZERO_OR_ONE)((0,_rxtree.copyNode)(b))/*{ oper: ZERO_OR_ONE, left: copyNode(b)}*/,max-min);}},{key:"oneOrMore",value:function oneOrMore(expr){if((0,_rxtree.boundary)(expr))throw new SyntaxError("repetition of boundary element: "+expr.val+" has no meaning");//this.operand.push({oper: DOT, left: expr, right:{ oper: ZERO_OR_MORE, left: expr}});
this.operand.push((0,_rxtree.RX_ONE_OR_MORE)(expr)/*RX_CONS(expr, RX_ZERO_OR_MORE(copyNode(expr)))*/);}},{key:"unaryOp",value:function unaryOp(op,expr){if((0,_rxtree.boundary)(expr))throw new SyntaxError("modifier ("+op.val+") of boundary element: "+expr.val+" has no meaning");this.operand.push((0,_rxtree.RX_UNARY)(op,expr));}}],[{key:"parse",value:function parse(str){//console.log("str", str instanceof RegExp, isRegExp(str), RegExp);
if(typeof str!='string'){str=str.toString().replace(/\\\//g,"/").replace(/^\/|\/$/g,"");//console.log("str-conv",str);
}//console.log("str",str);
var list=fixTokens(str.match(_utils.TOKINIZATION_RX));// tokenize the regular expression
list=list||[];//let scripter = (p,tok)
var s=list.reduce(function(parser,op){return parser.addToken(op);},new RxParser());//perform the parsing
if(s.val())s.pushOp(_rxtree.DOT,0);s.operand.push(_rxtree.DONE);s.pushOp(undefined,-1);return(0,_rxtree.makeFSM)(s.val());}}]);return RxParser;}();// Generate a string that will match the regex.
//
/* Work in progress
export generateStr(aNode, prefix, chooser) {
 if( aNode === undefined ) return prefix;
  if( aNode === DONE ) return prefix;
  if( aNode.type === 'N' && aNode.oper === undefined ) 
    return genSingle(aNode,prefix,chooser);
  if( dot(aNode) ) return generateStr(aNode.right,generateStr(aNode.left,prefix, chooser), chooser); 
  if(zero_or_more(aNode) || zero_or_one(aNode)) {
    let ix = chooser.count(0,zero_or_one(aNode)?10:1, prefix);
    for(let i=0; i<ix; i++) {
      prefix = generateStr(aNode.left,prefix, chooser);
    }
    return prefix;
  }
  if( or(aNode) )  {
    // collect all the or nodes
    // pick one at random
    // use that to generate the string
    let n = aNode;
    let list = [];
    while( or(n)) {
      list.push(n.left);
      n = n.right;
    }
    list.push(n);
    n = selectRandom(list);
  }
  throw new Error("Copy of an invalid node " + aNode); 
}
*/