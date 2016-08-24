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
import { assign, copy, extend                                                  } from "./utils";  
import { incrRegEx,convertMask ,isMeta, isOptional,isHolder                    } from "./incr-regex-v3";  
import {DONE,MORE,MAYBE,FAILED}                                                  from './rxtree';




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

		let m = this.minChars();
		i = tracker.length;
		let j = 0;
    for(; j<m.length && !isMeta(m.charAt(j)); j++,i++);
		return i;    
  	}

	getFirstEditableAtOrBefore(ix) {
		let tracker = this.getInputTracker();
		if( ix >= tracker.length ) ix = tracker.length-1;
		for(; ix>0;ix--) if( tracker[ix][1] === undefined ) return ix;
		return 0;  
	}

  getInputLength() {
  	return this.matcher.getInputLength();
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
  	 return this.matcher.match(ch);
  }


  matchStr(str) { /* public */
  	this._resetCache();
  	return this.matcher.matchStr(str);
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
    //	this._tracker = this.matcher.tracker;//this.matcher.getInputTracker();  
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