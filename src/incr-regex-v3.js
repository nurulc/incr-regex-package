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

//
"use strict";
import {ID, makeRegexp, parseMulti, odd, gtPrec,sprefix,rprefix,shead,stail,sRightMerge,
        stringToList, listToArray, listToString, StackDedup, n_cons, 
        n_head, n_tail, n_filter, n_reduce, n_map, n_concat, 
        n_removeAll } from "./utils"

//import {OR,ZERO_OR_ONE,,ZERO_OR_MORE,ONE_OR_MORE,DOT,FALSE,DONE,MORE,MAYBE,FAILED} from './regexp-parser';
import {DONE,MORE,MAYBE,FAILED,copyNode, printExpr, matchable,dot,or,
        zero_or_one,zero_or_more,boundary, makeFSM, RxParser} from './regexp-parser';

/*
export function regexx(str,v) {
  return new RX(str, v);
}
*/

export function incrRegEx(str,v) {
  return new IREGEX(str, v);
}


//========== CODE TO CHECK MINIMUM NUMBER of characters that must be input to finish the RegEx
//const HOLDER_ZERO_OR_MORE = '*';//"\u20e4" "\u2733" "\u2026";
//const HOLDER_ANY = '_';//"\u2581";
//const HOLDER_ZERO_OR_ONE = "?";//  "\u21a0"

const HOLDER_ZERO_OR_MORE = "\u22ef";// "\u26b9"; //"\u20e4" ;
const HOLDER_ANY = "\uff3f"; //"\u268a";//"\u05b7";//"\u035f"; ////"\u2581"; //"\u0332"; //"\u268a"; //
const HOLDER_ZERO_OR_ONE = "\u25d1"; //"\u21a0";

/*
const HOLDER_ZERO_OR_MORE = "*";
const HOLDER_ANY = "_";
const HOLDER_ZERO_OR_ONE = "?"

*/

export function convertMask(s) {
  let a  = [];
  return s.split('').map( c => 
                        c==="*"    ? HOLDER_ZERO_OR_MORE : (
                        c==="?"    ? HOLDER_ZERO_OR_ONE : 
                        (c === "_" ? HOLDER_ANY : c ))
              ).join('');
}
export function isMeta(ch) {
  return ch == HOLDER_ANY || isOptional(ch);
}

export function isOptional(ch) {
 return  ch == HOLDER_ZERO_OR_ONE || ch == HOLDER_ZERO_OR_MORE 
}

export function isHolder(ch) { return ch === HOLDER_ANY; }

function cleanMask(str) {
  let last = undefined;
  let list = [];
  for(let i=0; i<str.length; i++) {
    let c = str.charAt(i);
    if( isOptional(c) && last === c) continue;
    last = c;
    list.push(c);
  }
  return list.join('');
}



function strip(s, notAllowed) {
  for(let i=0; i<s.length; i++)
    if(!notAllowed(s.charAt(i))) return s.substring(i+1,s.length);
  return s;
}

function rationalize(s1,s2) {
  let l = s1.length < s2.length? s1.length : s2.length;
  let post = strip(rprefix(s1,s2),isOptional);
  let res = '';
  let hasNull = false;
  const GET = 1;
  const SKIP = 2;
  const stream = function(str) {
       let ix = 0;
       return function(flag){
          switch(flag) {
            case GET: return (ix < str.length? str.charAt(ix): undefined);
            case SKIP: ix++; break;
            default: return ix < str.length;
          }
        };
      };

  let eq =  function(a,b) {  return a == b || ( isOptional(a) && isOptional(b)); };
  let max = function(a,b) { return  a === HOLDER_ZERO_OR_MORE ? a : b; };
  let ss1 = stream(s1);
  let ss2 = stream(s2);
  for(; ss1() && ss2(); ) {
    let c1 = ss1(GET);
    let c2 = ss2(GET);
    let canbeNull = isOptional(c1) || isOptional(c2);
    //if( c1 === c2 && !canbeNull) res += c1;
    if( eq(c1,c2) ) { res += max(c1,c2); ss1(SKIP); ss2(SKIP); }
    else if( !canbeNull ) { res += HOLDER_ANY; ss1(SKIP); ss2(SKIP); }
    else if( isOptional(c1) ) { res += c1; ss1(SKIP); }
    else { res += c2; ss2(SKIP); }
  }
  return sRightMerge(res,post);
}


  function isLowerCase(ch) {
    var code = ch.charCodeAt(0);
    return ((code >= 97) && (code <= 122)); 
  }

  function __isDone1N(el) {
    return el === DONE;
  }

  export function __isDoneN(res) {
    return res !== undefined && 
           (res.filter(el => el === DONE).length === res.length);
  }


// e = [Nodes, undefined || n_cons(head,tail)]
function getMask(e) {

  if( !e ) return '';
  var rxNode = e;
  if(rxNode === DONE ) return '';
  if( dot(e) ) { // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
    return getMask(rxNode.left);
  } else if( or(rxNode) ) { //  /A|B/ => or(A,B)
      let LL = getMask(rxNode.left);
      let RL = getMask(rxNode.right);
      return rationalize(LL,RL); 
  }
  else if(zero_or_one(rxNode)) { // /A?/  => zero_or_one(A)
      return HOLDER_ZERO_OR_ONE+getMask(rxNode.nextNode);
  }
  else if(zero_or_more(rxNode)) { //  / A* / => zero_or_more(A)
      //console.log("* ",rxNode.nextNode);
      return HOLDER_ZERO_OR_MORE+getMask(rxNode.nextNode);
  }
  else if( matchable(rxNode) ) {
      let res = matchable(rxNode)(undefined);
      let v = res[1] || HOLDER_ANY;
      return v + getMask(rxNode.nextNode);
  } 
  else if( boundary(rxNode) ) {
      return '' + getMask(rxNode.nextNode);
  } 
  return '';
}


function getArrayMask(arr) {
  arr = arr || new StackDedup();
  return cleanMask(
            arr.reduce((a,b) => {
              let l =  getMask(b);
              a = a || l;
              return rationalize(a,l);
            }, undefined )
        );
}

function fixedAt(e) {

  if( !e ) return undefined;
  var rxNode = e;
  if(rxNode === DONE ) return undefined;
  if( dot(e) ) { // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
    return fixedAt(rxNode.left);
  } else if( or(rxNode) ) { //  /A|B/ => or(A,B)
      let c = fixedAt(rxNode.left);
      return  (!!c && c === fixedAt(rxNode.right))? c : undefined; 
  }
  else if(zero_or_one(rxNode)) { // /A?/  => zero_or_one(A)
      return undefined; //fixedAt(rxNode.nextNode);
  }
  else if(zero_or_more(rxNode)) { //  / A* / => zero_or_more(A)
      //console.log("* ",rxNode.nextNode);
      return undefined; //fixedAt(rxNode.nextNode);
  }
  else if( matchable(rxNode) ) {
      let res = matchable(rxNode)(undefined);
      //console.log(res);
      return res[1];
  } 
  else if( boundary(rxNode) ) {
      return fixedAt(rxNode.nextNode);
  } 
  return undefined;
}

function combine(a,b) { return (a === -1 || b === -1)? -1 : a+b; }

function fixedSizePattern(rxNode) {
 if( !rxNode ) return 0;

  if(rxNode === DONE ) return 0;
  if( dot(e) ) { // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
    return combine(fixedSizePattern(rxNode.left), fixedSizePattern(rxNode.right) );
  } else if( or(rxNode) ) { //  /A|B/ => or(A,B)
      let c = fixedSizePattern(rxNode.left);
      return  (c >= 0 && c === fixedSizePattern(rxNode.right))? c : -1; 
  }
  else if(zero_or_one(rxNode)) { // /A?/  => zero_or_one(A)
      return -1; //fixedAt(rxNode.nextNode);
  }
  else if(zero_or_more(rxNode)) { //  / A* / => zero_or_more(A)
      //console.log("* ",rxNode.nextNode);
      return -1; //fixedAt(rxNode.nextNode);
  }
  else if( matchable(rxNode) ) {   
      return res[1];
  } 
  else if( boundary(rxNode) ) {
      return fixedSize(rxNode.left);
  } 
  return 0; 
}

function getArrayFixedSize(arr) {
  let c = arr && arr.length >0 ? fixedSizePattern(arr.data[0]) : -1;
  //console.log("c", c, arr);
  return  (arr || new StackDedup()).reduce((a,b) => Math.min(a,fixedSizePattern(b)), c);
}

function getArrayFixedAt(arr) {
  let c = arr && arr.length >0 ? fixedAt(arr.data[0]) : undefined;
  //console.log("c", c, arr);
  return  (arr || new StackDedup()).reduce((a,b) => (a && a == fixedAt(b))?a:undefined, c);
}

function getPatternLen(e) {

  if( !e ) return 0;
  var rxNode = e;
  if(rxNode === DONE ) return 0;
  if( dot(e) ) { // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
    return getPatternLen(rxNode.left);
  } else if( or(rxNode) ) { //  /A|B/ => or(A,B)

      let LL = getPatternLen(rxNode.left);
      let RL = getPatternLen(rxNode.right);
      return LL === RL && (LL !== undefined)? LL : undefined; 
  }
  else if(zero_or_one(rxNode)) { // /A?/  => zero_or_one(A)
      return undefined;
  }
  else if(zero_or_more(rxNode)) { //  / A* / => zero_or_more(A)
      //console.log("* ",rxNode.nextNode);
      return undefined;
  }
  else if( matchable(rxNode) ) {
      let res = matchable(rxNode)(undefined);
      let v = getPatternLen(rxNode.nextNode);
      return v !== undefined ? v+1 : undefined;
  } 
  else if( boundary(rxNode) ) {
      return getPatternLen(rxNode.nextNode);
  } 
  return 0;
}


function getPatternLen(arr) {
  arr = arr || new StackDedup();
  return arr.reduce((a,b) => {
              let l =  getMask(b);
              a = a || l;
              return rationalize(a,l);
            }, 0 );
}

// New Regexp
export class IREGEX {
  constructor(str,v) {
      let len = 30;
      if( !str && !v) {
        this.str =  "";
        this.base = undefined;
        this.tracker= undefined;
        this.current = undefined;
        this.one = this.current;
        this.two = undefined;
        this.lastCh = undefined;
        this.maxLen = 0; 
        this._mask = undefined;
//        this._lastEditableIndex = undefined;
        len = fixedSizePattern(this.base);
        if( len <= 0 ) len = 30;
        this._len = len;  
      }
      else {
        if( !v && str) v = RxParser.parse(str);
        //if( v ) v = makeFSM(v);
        this.str =  str;
        this.base = v;
        this.tracker= [];
        this.current = new StackDedup(v);
        this.one = this.current;
        this.two = new StackDedup();
        this.lastCh = undefined;
        this.maxLen = 0;
        this.mask = undefined;                // cached value (set this to undefined everytime we change the tracker)
//        this._lastEditableIndex = undefined;  // cached value
        this._len = 30;
      }
  }

  get length() { return this._len; }
  
  toString() { return this.str; } /* public */
  getInputLength() { return this.tracker.length; }


  isDone(ix) {
    if( ix >= this.tracker.length || ix === undefined) {
      return this.state() === DONE;
    }
    return false;
  }


  getTree() { return this.base; } /* public */ // Get the parse tree from the regular expression
  minChars() { /* public */ // get a ask for the regular expression from the current state of the match
    //if( this._mask ) return this._mask;
    this._mask  = getArrayMask(this.current);
    return this._mask;
  }



  match(ch) { /* public */
     let fixed = getArrayFixedAt(this.current);

     let res = this.test(ch===HOLDER_ANY?undefined:ch);
     if( res === undefined && ch && isLowerCase(ch) ) {
        res = this.test(ch.toUpperCase());
        ch = ch.toUpperCase();
     }
     return this.update(res,ch, fixed);
  }


  matchStr(str) { /* public */
    let len = str.length;
    let b1=true,b2=0,b3=[];
    let i = 0;
    for(i=0; i<len;i++) {
      let ch = str[i];
      if( !this.match(ch)) { b1 = false; break;}
      this.lastCh = ch;
      b2++;
    }
    return [b1,b2,str.substring(0,i)];
  }

  state() { /* public */
    this._state = this._state || this.stateCompute();
    return this._state;
  }

  fixed() { return getArrayFixedAt(this.current); }

  reset() { /* public */
      this.tracker = [];
      this.current.reset();
      this.current.push(this.base);
      this.lastCh = undefined;
      this._state = undefined;
//      this._lastEditableIndex = undefined;
      this._mask = undefined;
      return this;
    }

  clone() { /* public */
         var t = incrRegEx();
         t.str = this.str;
         t.base = this.base;
         t.tracker = this.tracker.slice(0);  // copy
         t.one =     this.one.map(ID);
         t.two =     this.two.map(ID); 
         t.current = (this.current == this.one ? t.one : t.two) ;   
         t.lastCh = this.lastCh;
         t._state = this._state;
         t._mask = undefined;
//         t._lastEditableIndex = this._lastEditableIndex;
         t._len = this.length;
         
         return t;
  }

  getInputTracker() { return this.tracker.map(ID); }

// Private methods

  _after(all, ix) { /* public */ // get the input matched so far after ix. 
       if(!ix) {
           let al = all?this.tracker:this.tracker.filter( e => e[1] === undefined);
           return al.map(e => e[0] ).join('');
       } else {
           let al = this.tracker.filter( (e,i) => i>= ix && (all || e[1] === undefined));
           return al.map(e => e[0] ).join('');
       }      
  } 

 
  getArr() {
    if( this.current === this.one ) return this.two.reset();
    return this.one.reset();
  }


  action(e, ch, newStack,ignoreBoundary) {
    if(e === DONE ) {
      if(ch === DONE ) { 
        newStack.push(DONE); 
        return DONE; 
      }
      return FAILED;
    }
    else if( dot(e) ) {
      return this.action(e.left,ch, newStack,ignoreBoundary);
    }
    else if( or(e) ) {
          let rl =  this.action(e.left,ch, newStack, ignoreBoundary);
          let rr =  this.action(e.right,ch,newStack, ignoreBoundary);
          return this.result(rl,rr);
    }
    else if(zero_or_one(e) || zero_or_more(e)) {
          let rl =  boundary(e.left)? DONE : this.action(e.left,ch, newStack, true);
          let rr =  this.action(e.nextNode,ch,newStack);
          return this.result(rl,rr);
    }
    else if( matchable(e) ) {
       let res = e.match(ch);
       if( res[0] ) {
          newStack.push(e.nextNode);
        }
       return res[0]? (e.nextNode === DONE? DONE:MORE) : FAILED; 
    }
    else if( boundary(e) ) {
      if( ignoreBoundary ) return FAIL;
       let res = e.match(this.lastCh,ch);
       //console.log("boundary", res, "'"+ this.lastCh+"'", "'"+ch+"'");
       if( res[0] ) {
          e = e.nextNode;
          res = this.action(e,ch,newStack);
         // let f = function(e) { if( e === DONE ) return "DONE"; if( e === MORE ) return "MORE"; else return "FAILED"; }
         // console.log("boundary1", f(res), this.lastCh, ch);
          return res;
        }
       return FAILED; 
    }
    return FAILED;
  }


  result(l,r) {
    if( l === r) return l;
    if( l === MORE || r === MORE) return MORE;

  }

  test(ch,curr) {
      curr = curr || this.current;
      let res = FAILED;
      let next = this.getArr();
      let self = this;
      curr.forEach( e => { res = self.result(self.action(e,ch,next),res); }  );
      //console.log("Test",!!res , next.length);
      if( res === FAILED  || next.length === 0) {
        return undefined;
      }
      //console.log("TEST: ",next);
      return next;    
  }

  update(res,ch, fixed) {
          if( res !== undefined) {
            this.tracker.push([ch===undefined?HOLDER_ANY:ch, fixed]);
            if(res.maxLen > this.maxLen) this.maxLen = res.maxLen;
            this.current = res;
            this.lastCh = ch;
            this._state = undefined;
            this._mask = undefined;
//            this._lastEditableIndex = undefined;
          }
          return res !== undefined;
  }

  stateCompute() {
    //console.log("Compute State");
    var res = this.test(undefined);
    if( res === undefined ) return DONE;
    let isdone = this.test(DONE);
    //console.log("isDone", !!isdone);
    if( __isDoneN(isdone) ) return MAYBE;
    return MORE;
  }
}
