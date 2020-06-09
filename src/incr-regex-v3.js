/** 
 * Copyright (c) 2016, Nurul Choudhury
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

//
"use strict";
// import {gtPrec,sprefix,rprefix,shead,stail,sRightMerge,
//         stringToList, listToArray, listToString, StackDedup, n_cons, 
//         n_head, n_tail, n_filter, n_reduce, n_map, n_concat, 
//         n_removeAll, flatten,arr_push , arr_uniq } from "./utils";
import {ID } from "./utils";


import { DONE, MORE, MAYBE, getArrayFixedAt,
        HOLDER_ANY } from "./rxtree";
import {getArrayMask, BaseIncRegEx} from './regex-utils';
export {convertMask, isMeta, isOptional} from './regex-utils';
//import {RxParser} from './regexp-parser';

  function isLowerCase(ch) {
    var code = ch.charCodeAt(0);
    return ((code >= 97) && (code <= 122)); 
  }

// New Regexp
/**
 * 
 */
export class IREGEX extends BaseIncRegEx {

  /**
   * [length description]
   * @return {[type]} [description]
   */
  get length() { return this._len; }
  
  /**
   * [toString description]
   * @return {[type]} [description]
   */
  toString() { return this.str; } /* public */

  /**
   * [getInputLength description]
   * @return {[type]} [description]
   */
  getInputLength() { return this.tracker.length; }

  /**
   * [isDone description]
   * @param  {[type]}  ix [description]
   * @return {Boolean}    [description]
   */
  isDone(ix) {
    if( ix >= this.tracker.length || ix === undefined) {
      return this.state() === DONE;
    }
    return false;
  }

  /**
   * [getTree description]
   * @return {[type]} [description]
   */
  getTree() { return this.base; } /* public */ // Get the parse tree from the regular expression

  /**
   * [minChars description]
   * @return {[type]} [description]
   */
  minChars() { /* public */ // get a ask for the regular expression from the current state of the match
    this._mask  = getArrayMask(this.current);
    return this._mask;
  }

  /**
   * [match description]
   * @param  {singleCharacterString} ch the characted to match
   * @return {boolean}     
   */
  match(ch) { /* public */
     const fixed = getArrayFixedAt(this.current);

     let res = this.test(ch===HOLDER_ANY?undefined:ch);
     if( res === undefined && ch && isLowerCase(ch) ) {
        res = this.test(ch.toUpperCase());
        ch = ch.toUpperCase();
     }
     return this._update(res,ch, fixed);
  }


  /**
   * matchStr  will match as much of the input string as possible, 
   * return the result as rray with the following values
   * [
   *   matchFlag : boolean - true if the entire string matched, false otherwise
   *   count : integer - the lenght of the substring that matched
   *   matchingStr : string - the substring that matched
   * ]
   * @param  {string} str [description]
   * @return {[totalMatch: boolean, howManyMatched: int32, strThatMatched: string]}     
   */
  matchStr(str) { /* public */
    const len = str.length;
    let b1=true,b2=0; //,b3=[];
    let i = 0;
    for(i=0; i<len;i++) {
      let ch = str[i];
      if( !this.match(ch)) { b1 = false; break;}
      this.lastCh = ch;
      b2++;
    }
    return [b1,b2,str.substring(0,i)];
  }

  /**
   * [state description]
   * @return {[type]} [description]
   */
  state() { /* public */
    this._state = this._state || this._stateCompute();
    return this._state;
  }

  /**
   * [stateStr description]
   * @return {[type]} [description]
   */
  stateStr() {
      const s = this.state();
      if(s === MORE) return "MORE"; // match is not complete but good so far
      if( s === MAYBE) return "OK"; // match is complete but could have more
      return "DONE";
  }

  /**
   * [inputStr description]
   * @return {[type]} [description]
   */
  inputStr() {
    return this.tracker.map( (a) => a[0]).join('');
  }


  /**
   * [fixed description]
   * @return {[type]} [description]
   */
  fixed() { return getArrayFixedAt(this.current); }

  /**
   * [getCurrentStates description]
   * @return {[type]} [description]
   */
  getCurrentStates() {
    return this.current.map(ID);
  }



}

export function incrRegEx(str,v) {
  return new IREGEX(str, v);
}