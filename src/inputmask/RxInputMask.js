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
// Modified from https://github.com/insin/inputmask-core
//  This was originally written by insin - on GIT hub
//  The code worked fine for fixed formatted input mask, but is not so useful for
//  varible mask based on regular expression (RegExp)
//  That capability regires this implementation of Regexp, and provides incremental processing of regular expression
// Amost the entire original code has been replaces but the original interfaces remain
//
"use strict";
import { assign, copy, extend                                                  } from "../utils";  
import { incrRegEx,convertMask ,isMeta, isOptional,isHolder                    } from "../incr-regex-v3";
import { RxMatcher                    } from "../RxMatcher";  
import {DONE,MORE,MAYBE,FAILED,/*matchable,dot,or,zero_or_one,zero_or_more, boundary, RxParser,*/ printExpr,printExprN} from '../regexp-parser';


function has(object, key) {
    return object ? hasOwnProperty.call(object, key) : false;
}

function newSel(s,e) { e = e || s; return {start: Math.min(s,e), end: Math.max(s,e)}; }
function selPlus(sel, x,y) { return clip(newSel(sel.start+x,sel.end+(y==undefined?x:y))); }
function clip(sel, range) { 
  const clp = (x,r) => Math.max(Math.min(x,r.end),r.start);
  return !range ? sel : { start: clp(sel.start, range), 
                          end:   clp(sel.end,   range)};
}
function zero(x) { return !(x||0) ; }
function selRange(sel) { return sel?sel.end - sel.start:0; }
function zeroRange(sel) { return zero(selRange(sel)); }



export class RXInputMask{
    constructor(options) {
    
    options = assign({
      formatCharacters: null,
      pattern: null,
      selection: {start: 0, end: 0},
      value: ''
    }, options);

    if (options.pattern == null) {
      throw new Error('RXInputMask: you must provide a pattern.');
    }

  
    this.setPattern(options.pattern, {
      value: options.value,
      selection: options.selection
    });

  }



  /**
   * Applies a single character of input based on the current selection.
   * @param {string} char
   * @return {boolean} true if a change has been made to value or selection as a
   *   result of the input, false otherwise.
   */

  input(char) {
   // Ignore additional input if the cursor's at the end of the pattern
   if (zeroRange(this.selection) &&
       this.pattern.isDone(this.selection.start)) { // to do find out if we are at the end
     return false;
   }

   
   let res = this._input(char, this.selection, this.pattern); // returns [status:boolean, newSelection, newPattern]
   if( !res[0] ) return false;


   let valueBefore = this._getValue();
   
   let selectionBefore = this.selection;
   let patternBefore = this.pattern;
   this._lastOp = 'input';
   this.selection = res[1];
   this.pattern = res[2];
   this.value = this.getValue();
   
   // History
   if (this._historyIndex != null) {
     // Took more input after undoing, so blow any subsequent history away
     console.log('splice(', this._historyIndex, this._history.length - this._historyIndex, ')');
     this._history.splice(this._historyIndex, this._history.length - this._historyIndex);
     this._historyIndex = null;
   }
   if (this._lastOp !== 'input' ||
       !zeroRange(selectionBefore) ||
       this._lastSelection !== null && selectionBefore.start !== this._lastSelection.start) {
     this._history.push({value: valueBefore, selection: selectionBefore, lastOp: this._lastOp, pattern: patternBefore});
   }
   
   this._lastSelection = selectionBefore;
   return true;
  }

/**
* Internal method to add a character at the current position
* move all the characters. When inserting subsequent characters
* the syatem tries to take care of the fixed characters
* this is the same as the public input() method but it does not update history
* 
*  returns:  [status:boolean, newSelection:Selection, newPattern:]
*
*/


  _input(ch,selection, aPattern) {
   
         // check if we are under an empty slot, then we can set the value there without moving anything
         if( zeroRange(selection) && aPattern.emptyAt(selection.start)) {
            selection = selPlus(selection,1); ////newPattern.getFirstEditableAtOrAfter(selection.end+1);
            //console.log("INSERTED AT SELECTION");
            //throw new Error("Stopped Here");
         }
         
         let newPattern = aPattern.clone();  // copy the current
         selection = this._updateSelection(selection, newPattern.getFirstEditableAtOrAfter(selection.start)); // start from the first editable position
         let endPos = newPattern.getFirstEditableAtOrAfter(selection.end);
         let textAfterSelection = _after(newPattern,false,endPos); // get the raw value
         let inputIndex = selection.start;
         newPattern.setPos(inputIndex);
         
         if( ch !== undefined && !_skipAndMatch(newPattern,ch) ) { // but first make sure we did not enter a fixed character 
               return [false, selection,newPattern];
         }
         selection = this._updateSelection(selection, newPattern.getInputLength());
         endPos = Math.max(endPos, selection.end);
         let newPos = newPattern.getInputLength();
         // Put back the remainder
         // 

         let resultPattern = this._insertRest(textAfterSelection, newPattern, inputIndex,endPos+1);
         _fillInFixedValuesAtEnd(resultPattern || newPattern);
         
         // Advance the cursor to the next character
         return [true, newSel(newPos,newPos),resultPattern || newPattern];
  }

  _insertRest(textToAdd, aPattern, inputIndex, endIndex) {
     function _ins(textPos, textToAdd, aPattern, inputIndex, endIndex) {
        if( textPos >= textToAdd.length) return aPattern;
        if(inputIndex > endIndex || aPattern.isDone()) return aPattern;
        let alt = aPattern.clone();
        if( _skipAndMatch(alt, textToAdd.charAt(textPos) )) {
            //let res = _ins(textPos+1, textToAdd, alt, inputIndex+1, endIndex);
            let res = _ins(textPos+1, textToAdd, alt, alt.getInputLength()-1, endIndex);
            if( res != undefined ) return res;
        }
        //console.log("rx", aPattern);
         while(_skipFixed(aPattern, false));
         aPattern.match(undefined);
         return _ins(textPos, textToAdd, aPattern, inputIndex+1, endIndex);
     }
     //textToAdd = trimHolder(textToAdd);
     let retV = _ins(0, textToAdd, aPattern, inputIndex, endIndex+textToAdd.length);
     //while(aPattern.skipFixed(true));
     return retV;
  }

  

/**
 * Attempts to delete from the value based on the current cursor position or
 * selection.
 * @return {boolean} true if the value or selection changed as the result of
 *   backspacing, false otherwise.
 */

  backspace() {
  // If the cursor is at the start there's nothing to do
    let firstIx = this.pattern.getFirstEditableAtOrAfter(0);
    if (this.selection.start < firstIx || this.selection.end < firstIx) {
      return false;
    }

    let selectionBefore = copy(this.selection);
    let valueBefore = this._getValue();
    let start=this.selection.start, end=this.selection.end;

    // No range selected - work on the character preceding the cursor
    if (start === end) {
      start = this.pattern.getFirstEditableAtOrBefore(start-1);
      end = start+1;      
      if( start < firstIx ) return;
    }
    // Range selected - delete characters and leave the cursor at the start of the selection
    else {
      //end = this.pattern.getFirstEditableAtOrBefore(end);
      start = this.pattern.getFirstEditableAtOrBefore( (end < start? end : start));
      if( end === start) {
        end++;
      }
      if( end <= firstIx) return;
    }
    let result = this._input(undefined, newSel(start,end), this.pattern);
    let patternBefore = this.pattern;
    if( !result[0] ) return false;
    this.selection.start = this.selection.end = start;
    this.pattern = result[2];
    // History
    if (this._historyIndex != null) {
      // Took more input after undoing, so blow any subsequent history away
      this._history.splice(this._historyIndex, this._history.length - this._historyIndex)
    }
    if (this._lastOp !== 'backspace' ||
        selectionBefore.start !== selectionBefore.end ||
        this._lastSelection !== null && selectionBefore.start !== this._lastSelection.start) {
      this._history.push({value: valueBefore, selection: selectionBefore, lastOp: this._lastOp, pattern: patternBefore})
    }
    this._lastOp = 'backspace'
    this._lastSelection = copy(this.selection)

    return true
  }

  /**
   * Attempts to paste a string of input at the current cursor position or over
   * the top of the current selection.
   * Invalid content at any position will cause the paste to be rejected, and it
   * may contain static parts of the mask's pattern.
   * @param {string} input
   * @return {boolean} true if the paste was successful, false otherwise.
   */

   paste(input) {
     // This is necessary because we're just calling input() with each character
     // and rolling back if any were invalid, rather than checking up-front.
     var initialState = {
       value: this.value.slice(),
       selection: copy(this.selection),
       _lastOp: this._lastOp,
       _history: this._history.slice(),
       _historyIndex: this._historyIndex,
       _lastSelection: copy(this._lastSelection),
       pattern: this.pattern.clone()
     }

   // If there are static characters at the start of the pattern and the cursor
   // or selection is within them, the static characters must match for a valid
   // paste.
       let rest = this.getRawValueAt(this.selection.end); // get raw value from the pattern
       
       this.pattern.setPos(this.selection.start);
       let insVal = this._setValueFrom(this.selection.start, input);
       this.selection.end = this.pattern.getInputLength();
       if( !insVal || !this._setValueFrom(this.selection.end,rest) ) {
          assign(this, initialState);
          return false;
       }

       return true;
   }

  // History

   undo() {
     // If there is no history, or nothing more on the history stack, we can't undo
     if (this._history.length === 0 || this._historyIndex === 0) {
       return false
     }

     var historyItem;
     if (this._historyIndex == null) {
       // Not currently undoing, set up the initial history index
       this._historyIndex = this._history.length - 1;
       historyItem = this._history[this._historyIndex];
       // Add a new history entry if anything has changed since the last one, so we
       // can redo back to the initial state we started undoing from.
       var value = this._getValue();
       if (historyItem.value !== value ||
           historyItem.selection.start !== this.selection.start ||
           historyItem.selection.end !== this.selection.end) {
         this._history.push({value: value, selection: copy(this.selection), lastOp: this._lastOp, startUndo: true, pattern: this.pattern.clone() });
       }
     }
     else {
       historyItem = this._history[--this._historyIndex];
     }

     this.pattern = historyItem.pattern;
     this.setValue(historyItem.value);
     this.selection = historyItem.selection;
     this._lastOp = historyItem.lastOp;
     return true
   }

   redo() {
     if (this._history.length === 0 || this._historyIndex == null) {
       return false;
     }
     var historyItem = this._history[++this._historyIndex]
     // If this is the last history item, we're done redoing
     if (this._historyIndex === this._history.length - 1) {
       this._historyIndex = null
       // If the last history item was only added to start undoing, remove it
       if (historyItem.startUndo) {
         this._history.pop();
       }
     }
     this.pattern = historyItem.pattern.clone();
     this.setValue(historyItem.value);
     this.selection = historyItem.selection;
     this._lastOp = historyItem.lastOp;

     return true
   }

   left(selection) {
    let sel = copy(selection);
    if( sel && zeroRange(sel) ) {
      sel.start = sel.end = selection.start-1;
      this.setSelection(sel);      
    }
    return this;
   }

   right(selection) {
    let sel = copy(selection);
    if( sel && sel.start === sel.end) {
      sel.start = sel.end = selection.start+1;
      this.setSelection(sel);      
    }
    return this;
   }

  // Getters & setters

   setPattern(pattern, options) {
     options = assign({
//       selection: {start: 0, end: 0},
       value: ''
     }, options)
     this.pattern = new RxMatcher(incrRegEx(pattern));
     this.setValue(options.value)
     this.emptyValue = this.pattern.minChars();
     this.setSelection(options.selection);
     while(this.skipFixed());
     if( zeroRange(this.selection) && this.pattern.getInputTracker().length != 0 ) {
        var ss = this._getValue();
        this.setValue(ss);
        this.selection.start = this.selection.end = ss.length;
     }
     this._resetHistory();
     return this;
   }

   select( low, high) {
    this.selection = ( high < low)?newSel(high,low):newSel(low,high);
    return this;
   }

   setSelection(selection) {
     let sel = selection===this.selection? this.selection:copy(selection);
     let old = this.selection || sel ;

     this.selection = old;
     let firstEditableIndex = this.pattern.getFirstEditableAtOrAfter(0);
     let lastEditableIndex = this.pattern.lastEditableIndex();
     let range = newSel(firstEditableIndex,lastEditableIndex)
     if (zeroRange(sel)) {
       sel = clip(sel,range);
       if (sel.start < firstEditableIndex) {
         this.selection = sel;
         this.selection.start = this.selection.end = firstEditableIndex
         this.pattern.setPos(firstEditableIndex);
         return this;
       }
       if (sel.end > lastEditableIndex) {
         this.selection = sel;
         this.selection.start = this.selection.end = lastEditableIndex;
         this.pattern.setPos(firstEditableIndex);
         return this;
       }
       // check if we moved left 
       if( selection.start < old.start) { // moved left
          let ix = this.pattern.getFirstEditableAtOrBefore(sel.start);
          let msk = this.getValue();
          while( isOptional(msk.charAt(ix)) && ix > firstEditableIndex) ix--;
          this.selection = sel;
          this.selection.start = this.selection.end = ix;
          return this;   
       }
       else if( selection.start > old.start) {
          let ix = this.pattern.getFirstEditableAtOrAfter(sel.start);
          let msk = this.pattern.minChars();
          while( isOptional(msk.charAt(ix)) && ix < msk.length) ix++;
          this.selection = sel;
          this.selection.start = this.selection.end = ix;
          return this;
       }
     } else {
      if (this.selection.start < firstEditableIndex) {
         this.selection.start = firstEditableIndex;
      } else if (this.selection.end > lastEditableIndex) {
         this.selection.end = lastEditableIndex;
      } else {

      }
     }
     return this;
   }

   _setValueFrom(ix,str) {
      let newPattern = this.pattern.clone();
      let success = true;
      if( ix !== undefined) newPattern.setPos(ix);
      for(let i = ix, j=0;j<str.length && success ; i++, j++ ) {
            let c = str.charAt(j); 
            success &= _skipAndMatch(newPattern,c);
      }
      if( success ) {
        _fillInFixedValuesAtEnd(newPattern)
        this.pattern = newPattern;
      }
      return success;  
   }

  setValue(value) {
     if(this.getValue() === value) return true;
     let workingPattern = this.pattern.clone();
     if (value == null) {
       value = ''
     }
     workingPattern.reset();
     for(let i=0; i<value.length; i++) {
        let c = value.charAt(i);
        if(value.substring(i) === workingPattern.minChars()) break;
        if( isHolder(c)) c = undefined;
        if(!_skipAndMatch(workingPattern,c)) {
          return false;
        }
        
     }
     
     //_fillInFixedValuesAtEnd(this.pattern);
     this.pattern = workingPattern;
     this.value = this.getValue();
     return true;
  }

  getSelection() {
    return copy(this.selection);
  }

  _getValue() {
     return _after(this.pattern,true,0);
   }

  getValue() {
     return _after(this.pattern, true,0)+this.pattern.minChars(); //.valueWithMask();
     //return this.pattern.rawValue(0);
     //return this._getValue()
  }

  getRawValue() {
    return _after(this.pattern,false,0);
  }

  getRawValueAt(ix) {
    return _after(this.pattern,false,ix);
  }

   reset() {
       this.pattern.reset();
       this._resetHistory();
       this.value = this.getValue();
       this.selection.start = this.selection.end = 0;
       this.setSelection(this.selection); 
       return this;
   }

   _resetHistory() {
       this._history = [];
       this._historyIndex = null;
       this._lastOp = null;
       this._lastSelection = copy(this.selection);
       return this;
   }

   _updateSelection(aSelection, start) {
      let res = copy(aSelection);
      res.start = start;
      if( start > res.end) res.end = start;
      return res;
   }

   skipFixed() {
    _skipFixed(this.pattern)
   }


}

   // *pattern Helpers

  function _fillInFixedValuesAtEnd(pattern) {
    let s = pattern.minChars();
    let i = 0
    for(;s.length > i  && !isMeta(s.charAt(0)); i++) {
      if( ! pattern.match(s.charAt(0))) return i > 0;
      s = pattern.minChars();
    }
    return i>0;
  }

  function _skipFixed(aPattern, onlyFixed) {
    let s = aPattern.minChars();
    onlyFixed = !!onlyFixed;
    if( onlyFixed !== true && s.length > 1 && isOptional(s.charAt(0)) && !isMeta(s.charAt(1)) ) {
      if (aPattern.match(s.charAt(1))) return true; 
    }
    else if( /* onlyFixed === true && */ s.length >= 1 && !isMeta(s.charAt(0))) return aPattern.match(s.charAt(0));
    return false;
  }


  function _skipAndMatch(aPattern, ch) {
    if(aPattern.match(ch)) return true;
    let backup = aPattern.clone();
    while( _skipFixed(aPattern,false) ) {
      if( aPattern.match(ch) ) return true;
    }
    aPattern.reset();
    aPattern.matchStr(_after(backup,true,0));
    return false;
  }

 export function trimHolder(textToAdd) {
    let i = textToAdd.length -1;
    for(; i>=0 && isHolder(textToAdd.charAt(i)); i--);
    return textToAdd.substring(0,i+1);
  }

export function  _after(aPattern, all, ix) { /* public */ // get the input matched so far after ix.
      let tracker = aPattern.getInputTracker(); 
       if(!ix) {
           let al = all?tracker:tracker.filter( e => e[1] === undefined);
           return al.map(e => e[0] ).join('');
       } else {
           let al = tracker.filter( (e,i) => i>= ix && (all || e[1] === undefined));
           return al.map(e => e[0] ).join('');
       }      
  } 

 

"use strict";