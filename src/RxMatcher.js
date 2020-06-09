/** 
 * Copyright (c) 2016..2020, Nurul Choudhury
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 */



"use strict";
//import { assign, copy, extend                                                  } from "./utils";  
//import { incrRegEx                                                             } from "./incr-regex-v3";  
import { isHolder, isMeta                             } from "./regex-utils";  
import { DONE, rxContentsToMask } from './rxtree';


// array of [ [type, ch] ...]
// function hasMetaChars(tracker) { 
//   return tracker.find(([, ch]) => isHolder(ch));
// }


function _fixTracker(tracker,i) {
  let elem = tracker[i];
  if(elem[1] !== undefined && elem[0] !== elem[1]) {
    elem[0] = elem[1];
    //console.log(`fixTracker: set Value at: ${i} to '${elem[1]}'`)
  }
  //else console.log(`fixTracker: no action at: ${i} val: '${elem[0]}'  state:'${elem[1]}'`)
}

export class RxMatcher {
  constructor(matcher) {
    this.matcher = matcher;
    this._lastEditableIndex = undefined;
    //this._tracker;
  }

  getFirstEditableAtOrAfter(ix) {
    let i = ix;
    let tracker = this.getInputTracker();
    for(;i < tracker.length; i++) 
      if(tracker[i][1] === undefined) return i;
      else _fixTracker(tracker,i); // make sure we fixup the value of fixed values

    let m = this.minChars();
    i = tracker.length;
    let j = 0;
    for(; j<m.length && !isMeta(m.charAt(j)); j++,i++);
    return i;    
    }

  // we we find a position that has aholder, but should be a fixed characted
  // convert the older to a fixed character
  fixTracker() {
    let tracker = this.getInputTracker();
    for(var i=0; i < tracker.length; i++) {
      _fixTracker(tracker,i);
    }
  }  

  getFirstEditableAtOrBefore(ix) {
    let tracker = this.getInputTracker();
    if( ix >= tracker.length ) ix = tracker.length-1;
    for(; ix>0;ix--) 
      if( tracker[ix][1] === undefined ) return ix;
      else _fixTracker(tracker,ix);
    return 0;  
  }

  getInputLength() {
    return this.matcher.getInputLength();
  }

  /*
     This code will use back propogation, that given input, for example

      input: xxx______________yyy
      patter: p
      fill in the unknows, kind of algebra problem
      suppose p = /xxx\d.*fred\d{9}yyy|xxx.joy.*zzz/
      input must be: xxx_fred_________yyy
      nothing else will fit.
      This is a tricky problem, I am not confident i have a provably
      correct algorithm for this to handle all edge cases, but the
      back propogation method will handle most cases
  */
  updateFixed() {
    //console.log(`updateFixed: ${start}, ${end} not yet implemented`);
    //this.fixTracker();
    //if( !hasMetaChars(this.getInputTracker())) return false;
    let s = this.matcher.inputStr();
    s = rxContentsToMask(this.matcher.base,s);
    if( s != undefined ) {
      this.matcher.reset();
      this.matcher.matchStr(s);
      return true;
    }
    return false;
  }

  setPos(ix) {
     //let currTracker = this.tracker.slice(0); // copy the array
     if( ix !== undefined ) {
       let tracker = this.getInputTracker();
       let s = tracker.map(s => s[0]).join('').substr(0,ix);
       this.reset();
       this.matchStr(s);
       tracker = this.getInputTracker(); // have to do this since we did some matching
       for(;tracker.length<ix && this.fixed() !== undefined;) 
          if( !this.match(this.fixed()) ) {
            ix = this.getInputLength();
            break;
          }
      //this._mask = undefined;
       this._resetCache();
     } 
     return ix;
  }

  get length() { return this.matcher.length; }

  toString() { return this.matcher.toString(); } /* public */



  after(ix) { return this.matcher._after(true,ix); }
  valueWithMask() { return this.matcher.valueWithMask(); }
  rawValue(ix) { return this.matcher.rawValue(ix); }
  _after(flag, ix) { return this.matcher._after(flag,ix); }

  isDone(ix) { return this.matcher.isDone(ix); }

  setToFirstEditableAfter(ix) { 
    if(ix === undefined) ix = this.getInputLength();
    return this.setPos(this.getFirstEditableAtOrAfter(ix)); 
  }

  lastEditableIndex() {
    if(this._lastEditableIndex === undefined) {
      let tracker = this.getInputTracker();
      let rx = this.clone();
      let ix = this.getFirstEditableAtOrAfter(tracker.length);
      rx.setPos(ix);
      if(rx.state() === DONE) ix = tracker.length;
      this._lastEditableIndex = ix;
    }
    return this._lastEditableIndex; 
  }

  getTree() { return this.matcher.getTree(); } /* public */ // Get the parse tree from the regular expression

  minChars(ix) { /* public */ // get a ask for the regular expression from the current state of the match
    if( ix === undefined) return this.matcher.minChars();
    let p = this.matcher.clone();
    let s = this.matcher._after(true,0).substring(0,ix);
    p.reset();
    let ret = p.matchStr(s);
    //console.log("ix: ",ix, " str: '", s,"'");
    if( !ret[0] ) {
      throw new Error( "Unexpected error (matchStr failed) from "+ p.constructor.name || "IREGEX");
    }
    return p.minChars();
  }

  minCharsList(flag) {
     //if( !flag ) throw new Error("flag should be true");
    return this.matcher.minCharsList(flag);
  }


  emptyAt(ix) {
    let tracker = this.getInputTracker();
    if(ix < tracker.length) return isHolder(tracker[ix][0]);
    return false;
  }

  match(ch) { /* public */
     this._resetCache();
     let ret = this.matcher.match(ch);
     this.fixTracker();
     return ret;
  }


  matchStr(str) { /* public */
    this._resetCache();
    let ret = this.matcher.matchStr(str);
    this.fixTracker();
    return ret;
  }

  state() { /* public */
    return this.matcher.state();
  }

  fixed() { return this.matcher.fixed(); }

  reset() { /* public */
      this.matcher.reset();
      this._resetCache();
      return this;
  }

  clone() {
    return new RxMatcher(this.matcher.clone());
  }


  getInputTracker() {
    //if( this._tracker === undefined ) 
    //  this._tracker = this.matcher.tracker;//this.matcher.getInputTracker();  
    //return this._tracker; 
    return this.matcher.tracker;
  }


  getFullTracker() {
    let t = this.getInputTracker();
    let rest = this.matcher.minChars().map(c => isMeta(c)?[c,undefined]:[c,c]);
    //return append(t,rest);
    return [].concat(t,rest);
  }

  _resetCache() {
    //this._tracker = undefined;
    this._lastEditableIndex = undefined;
  }

  stateStr() {
    return this.matcher.stateStr();
  } 

}