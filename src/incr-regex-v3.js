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
        n_removeAll, flatten,arr_push , arr_uniq } from "./utils";


import { matchable,boundary,dot,or,zero_or_one,zero_or_more, DONE, FAILED, MORE, MAYBE,makeFSM, getArrayFixedAt} from "./rxtree";

// matchable, boundary,
import {RxParser} from './regexp-parser';
import {printExpr} from "./rxprint";        

/*
export function regexx(str,v) {
  return new RX(str, v);
}
*/

[matchable,boundary,dot,or,zero_or_one,zero_or_more, DONE, FAILED, MORE, MAYBE, makeFSM].map( e => { if( e ===undefined ) throw new Error("boundary not defined") } );

export function incrRegEx(str,v) {
  return new IREGEX(str, v);
}


//========== CODE TO CHECK MINIMUM NUMBER of characters that must be input to finish the RegEx
//const HOLDER_ZERO_OR_MORE = '*';//"\u20e4" "\u2733" "\u2026";
//const HOLDER_ANY = '_';//"\u2581";
//const HOLDER_ZERO_OR_ONE = "?";//  "\u21a0"

export const HOLDER_ZERO_OR_MORE = "\u22ef";// "\u26b9"; //"\u20e4" ;
export const HOLDER_ANY = "\uff3f"; //"\u268a";//"\u05b7";//"\u035f"; ////"\u2581"; //"\u0332"; //"\u268a"; //
export const HOLDER_ZERO_OR_ONE = "\u25d1"; //"\u21a0";

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
  return ch === HOLDER_ANY || isOptional(ch);
}

export function isOptional(ch) {
 return  ch === HOLDER_ZERO_OR_ONE || ch === HOLDER_ZERO_OR_MORE ;
}

export function isHolder(ch) { return ch === HOLDER_ANY; }

function cleanMask(str) {
  let last; // undefined
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

// [or, p1,p2,p...]
// [dot, p1, p2, p...]
// [zero_or_one, p1]
// [zero_or_more, p1]
// function binary op form to n-arrya form
// [ op,  [op, x, y...], z] => [ op, x, y..., z] (applied recursively)
// [ op,  x, [op, y, z...]] => [ op, x, y, z...] (applied recursively)
function flattenRX(arr, code,  res) {
  if(!Array.isArray(arr)) return arr_push(res, arr);

  let codex = arr[0];
  if( code !== codex) { 
    let r = flattenRX(arr,codex, [codex]);
    return ( res ) ? arr_push(res, r) : r;
  }
  
  return arr.reduce( (res,a) => flattenRX(a, codex, res));
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



//unit = [a]
//merge(a,b) = flatten([a,b]);
export function makeRxInfo(unit, addElem, merge, optional, mapper) {
  const addOpt = (rxNode,prefix) => {
    if(zero_or_more(rxNode)) return addElem(prefix, HOLDER_ZERO_OR_MORE);
    return prefix;
  }
  return getRxInfo;
  //--- returns the function below ---
  function getRxInfo(rxNode,prefix, optStop) {

    if( !rxNode ) return unit(prefix);
    if( optStop && rxNode === n_head(optStop) )  { // if we should match stop node, then pop the stop node 
                                                   // (usually its because we found a loop). Remove the node from the stack {n_tail(optStrop)},
                                                   // and procees with the next element 
      return getRxInfo(rxNode.nextNode,addOpt(rxNode, prefix),n_tail(optStop));
    }
    if(rxNode === DONE ) return unit(prefix);
    if( dot(rxNode) ) { // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
      //console.log("getMaskListOLD-dot");
      return getRxInfo(rxNode.left,prefix, optStop);
    } else if( or(rxNode) ) { //  /A|B/ => or(A,B)
        //console.log("getMaskListOLD - or");
        let LL = getRxInfo(rxNode.left,prefix,optStop);
        let RL = getRxInfo(rxNode.right,prefix,optStop);
        return merge(LL,RL); 
    }
    else if(zero_or_one(rxNode)) { // /A?/  => zero_or_one(A)
        if( optional ) {
          return optional(rxNode, prefix, getRxInfo, optStop );
        }  
        else return getRxInfo(rxNode.nextNode,addElem(prefix,HOLDER_ZERO_OR_ONE), optStop);
    }
    else if(zero_or_more(rxNode)) { //  / A* / => zero_or_more(A)        
        if( optional ){
           return optional(rxNode, prefix, getRxInfo,optStop );
        }
        else return getRxInfo(rxNode.nextNode,addElem(prefix,HOLDER_ZERO_OR_MORE),optStop);;
    }
    else if( matchable(rxNode) ) {
        let res = matchable(rxNode)(undefined);
        let v = res[1] || (mapper?mapper(rxNode,HOLDER_ANY):HOLDER_ANY);
        //console.log("getMaskListOLD", v);
        return getRxInfo(rxNode.nextNode,addElem(prefix,v),optStop);
    } 
    else if( boundary(rxNode) ) {
        return getRxInfo(rxNode.nextNode,prefix, optStop);
    } 
    return unit(prefix);
  }
}

function makeArrayRxInfo(func,merge, base) {
  return getArrayRxInfo;

  function getArrayRxInfo(arr,prefix) {
    return arr.reduce((a,b) => {
                return merge(a,func(b,prefix));
              }, base() ) ;
          
  }
}

function mapper(rxn, deflt) {
  if( !rxn ) return deflt;
  switch(rxn.val) {
    case "[0-9]": 
    case "\\d": return "9\u0332";
    case "[A-Za-z]":
    case "[a-zA-Z]" : 
    case "[a-z]": return "a\u0332";
    case "[A-Z]" : return "A\u0332";
    case "[0-9A-Za-z]":
    case "[A-Z0-9a-z]":
    case "[A-Za-z0-9]":
    case "[0-9a-zA-Z]":
    case "[a-z0-9A-Z]":
    case "[a-zA-Z0-9]": return "z\u0332"; 
    default: return deflt;
  }
}

const arrayMaskListBuilder = ( (mapper,useopt) => {
   const unit = (a) => a ===undefined ? [] : [a];
   const addElem = (a,b) => a+b;
   const merge = (a,b) => flatten([a,b]);
   const aMerge = (a,b) => flatten(arr_push(a,b));
   const optfn = (rxn, prefix, getRxInfo, optStop) => { // interesting function, to deal with loops/optional
    if( rxn.left ) {
        let ll =   getRxInfo(rxn.nextNode,prefix,optStop);
        let rr =  getRxInfo(rxn.left,prefix, 
                              zero_or_more(rxn)?
                                  n_cons(rxn,optStop):            // this is the optional part that could loop, push rxn (rx node) on the stack
                                                                  //   if we cone back to this node and find rxn of the stack, do not loop again                 
                                  optStop);                       // Non-looping optional      
        return merge(ll,rr);
    }
   }
   let  optional = useopt?optfn:undefined;;

   return makeArrayRxInfo(makeRxInfo(unit,addElem, merge,optional,mapper), aMerge, unit )
});

const getArrayMaskListFull = arrayMaskListBuilder(mapper,true);
const getArrayMaskList = arrayMaskListBuilder(mapper,false);


const getArrayMask = (() => {
     const unit = (a) => a ;
     const addElem = (a,b) => a+b;
     const merge = (a,b) => rationalize(a,b);
     const aMerge = (a,b) => rationalize(a || b, b);
     const fn = makeArrayRxInfo(makeRxInfo(unit,addElem, merge), aMerge, unit );
     return (rx) => cleanMask(fn(rx,''))
   }
  )();

function combine(a,b) { return (a === -1 || b === -1)? -1 : a+b; }

function fixedSizePattern(rxNode) {
 if( !rxNode ) return 0;

  if(rxNode === DONE ) return 0;
  if( dot(rxNode) ) { // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
    return combine(fixedSizePattern(rxNode.left), fixedSizePattern(rxNode.right) );
  } else if( or(rxNode) ) { //  /A|B/ => or(A,B)
      let c = fixedSizePattern(rxNode.left);
      return  (c >= 0 && c === fixedSizePattern(rxNode.right))? c : -1; 
  }
  else if(zero_or_one(rxNode) || zero_or_more(rxNode) ) return -1; 
  else if( matchable(rxNode) ) { 
      let res = matchable(rxNode)(undefined);  
      return res[1];
  } 
  else if( boundary(rxNode) ) {
      return fixedSizePattern(rxNode.left);
  } 
  return 0; 
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

  minCharsList(flag) {
    const fn = flag ? getArrayMaskListFull : getArrayMaskList;
    //if( !flag ) throw new Error("flag should be true");
    return arr_uniq(fn(this.current,this.inputStr()));
  }



  match(ch) { /* public */
     const fixed = getArrayFixedAt(this.current);

     let res = this.test(ch===HOLDER_ANY?undefined:ch);
     if( res === undefined && ch && isLowerCase(ch) ) {
        res = this.test(ch.toUpperCase());
        ch = ch.toUpperCase();
     }
     return this._update(res,ch, fixed);
  }


  matchStr(str) { /* public */
    const len = str.length;
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
    this._state = this._state || this._stateCompute();
    return this._state;
  }

  stateStr() {
      const s = this.state();
      if(s === MORE) return "MORE"; // match is not complete but good so far
      if( s === MAYBE) return "OK"; // match is complete but could have more
      return "DONE";
  }

  inputStr() {
    return this.tracker.map( (a) => a[0]).join('');
  }

  fixed() { return getArrayFixedAt(this.current); }

  getCurrentStates() {
    return this.current.map(ID);
  }

  reset() { /* public */
      this.tracker = [];
      this.current.reset();
      this.current.push(this.base);
      this.lastCh = undefined;
      this._state = undefined;
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

 
  _getArr() {
    if( this.current === this.one ) return this.two.reset();
    return this.one.reset();
  }


  action(e, ch, newStack,ignoreBoundary) {
    if(e === DONE ) {
      if(ch === DONE) { 
        newStack.push(DONE);
        //if(this.nurul)  console.log("*** DONE: ",ch);
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
          return this._result(rl,rr);
    }
    else if(zero_or_one(e) || zero_or_more(e)) {
          let rl =  boundary(e.left)? DONE : this.action(e.left,ch, newStack, true);
          let rr =  this.action(e.nextNode,ch,newStack,ignoreBoundary);
          return this._result(rl,rr);
    }
    else if( matchable(e) ) {
       let res = e.match(ch);
       //if(this.nurul) console.log("match: ",ch);
       if( res[0] ) {
          newStack.push(e.nextNode);
        }
       return res[0]? (e.nextNode === DONE? DONE:MORE) : FAILED; 
    }
    else if( boundary(e) ) {
      if( ignoreBoundary ) return FAILED;
      //if( ch === DONE && this.nurul) console.log("boundary",ch)
      if( ch === DONE) return  this.action(e.nextNode,ch,newStack);// ignore the boundary
    
       let res = e.match(this.lastCh,ch);
       if( res[0] || ch === undefined) {
          return  this.action(e.nextNode,ch,newStack);
        }
       return FAILED; 
    }
    return FAILED;
  }


  _result(l,r) {
    if( l === r) return l;
    if( l === MORE || r === MORE) return MORE;

  }

  test(ch,curr) {
      curr = curr || this.current;
      let res = FAILED;
      let next = this._getArr();
      curr.forEach( e => { res = this._result(this.action(e,ch,next),res); }  );
      if( res === FAILED  || next.length === 0) {
        return undefined;
      }
      //console.log("TEST: ",next);
      return next;    
  }

  _update(res,ch, fixed) {
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

  _stateCompute() {
    //console.log("Compute State");
    var res = this.test(undefined);
    //if( this.nurul && res !== undefined) console.log("state:",res);
    if( res === undefined ) return DONE;
    let isdone = this.test(DONE);
    //if(isdone === undefined) return DONE;
    if( __isDoneN(isdone) ) return MAYBE;
    return MORE;
  }


}
