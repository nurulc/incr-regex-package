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

*/"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.RxMatcher=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break;}}catch(err){_d=true;_e=err;}finally{try{if(!_n&&_i["return"])_i["return"]();}finally{if(_d)throw _e;}}return _arr;}return function(arr,i){if(Array.isArray(arr)){return arr;}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i);}else{throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _utils=require("./utils");var _incrRegexV=require("./incr-regex-v3");var _rxtree=require("./rxtree");function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}// array of [ [type, ch] ...]
function hasMetaChars(tracker){return tracker.find(function(_ref){var _ref2=_slicedToArray(_ref,2);var _=_ref2[0];var ch=_ref2[1];return(0,_incrRegexV.isHolder)(ch);});}function _fixTracker(tracker,i){var elem=tracker[i];if(elem[1]!==undefined&&elem[0]!==elem[1]){elem[0]=elem[1];//console.log(`fixTracker: set Value at: ${i} to '${elem[1]}'`)
}//else console.log(`fixTracker: no action at: ${i} val: '${elem[0]}'  state:'${elem[1]}'`)
}var RxMatcher=exports.RxMatcher=function(){function RxMatcher(matcher){_classCallCheck(this,RxMatcher);this.matcher=matcher;this._lastEditableIndex=undefined;//this._tracker;
}_createClass(RxMatcher,[{key:"getFirstEditableAtOrAfter",value:function getFirstEditableAtOrAfter(ix){var i=ix;var tracker=this.getInputTracker();for(;i<tracker.length;i++){if(tracker[i][1]===undefined)return i;else _fixTracker(tracker,i);}// make sure we fixup the value of fixed values
var m=this.minChars();i=tracker.length;var j=0;for(;j<m.length&&!(0,_incrRegexV.isMeta)(m.charAt(j));j++,i++){}return i;}// we we find a position that has aholder, but should be a fixed characted
// convert the older to a fixed character
},{key:"fixTracker",value:function fixTracker(){var tracker=this.getInputTracker();for(var i=0;i<tracker.length;i++){_fixTracker(tracker,i);}}},{key:"getFirstEditableAtOrBefore",value:function getFirstEditableAtOrBefore(ix){var tracker=this.getInputTracker();if(ix>=tracker.length)ix=tracker.length-1;for(;ix>0;ix--){if(tracker[ix][1]===undefined)return ix;else _fixTracker(tracker,ix);}return 0;}},{key:"getInputLength",value:function getInputLength(){return this.matcher.getInputLength();}/*
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
  */},{key:"updateFixed",value:function updateFixed(){//console.log(`updateFixed: ${start}, ${end} not yet implemented`);
//this.fixTracker();
//if( !hasMetaChars(this.getInputTracker())) return false;
var s=this.matcher.inputStr();s=(0,_rxtree.rxContentsToMask)(this.matcher.base,s);if(s!=undefined){this.matcher.reset();this.matcher.matchStr(s);return true;}return false;}},{key:"setPos",value:function setPos(ix){//let currTracker = this.tracker.slice(0); // copy the array
if(ix!==undefined){var tracker=this.getInputTracker();var s=tracker.map(function(s){return s[0];}).join('').substr(0,ix);this.reset();this.matchStr(s);tracker=this.getInputTracker();// have to do this since we did some matching
for(;tracker.length<ix&&this.fixed()!==undefined;){if(!this.match(this.fixed())){ix=this.getInputLength();break;}}//this._mask = undefined;
this._resetCache();}return ix;}},{key:"toString",value:function toString(){return this.matcher.toString();}/* public */},{key:"after",value:function after(ix){return this.matcher._after(true,ix);}},{key:"valueWithMask",value:function valueWithMask(){return this.matcher.valueWithMask();}},{key:"rawValue",value:function rawValue(ix){return this.matcher.rawValue(ix);}},{key:"_after",value:function _after(flag,ix){return this.matcher._after(flag,ix);}},{key:"isDone",value:function isDone(ix){return this.matcher.isDone(ix);}},{key:"setToFirstEditableAfter",value:function setToFirstEditableAfter(ix){if(ix===undefined)ix=this.getInputLength();return this.setPos(this.getFirstEditableAtOrAfter(ix));}},{key:"lastEditableIndex",value:function lastEditableIndex(){if(this._lastEditableIndex===undefined){var tracker=this.getInputTracker();var rx=this.clone();var ix=this.getFirstEditableAtOrAfter(tracker.length);rx.setPos(ix);if(rx.state()===_rxtree.DONE)ix=tracker.length;this._lastEditableIndex=ix;}return this._lastEditableIndex;}},{key:"getTree",value:function getTree(){return this.matcher.getTree();}/* public */// Get the parse tree from the regular expression
},{key:"minChars",value:function minChars(ix){/* public */// get a ask for the regular expression from the current state of the match
if(ix===undefined)return this.matcher.minChars();var p=this.matcher.clone();var s=this.matcher._after(true,0).substring(0,ix);p.reset();var ret=p.matchStr(s);//console.log("ix: ",ix, " str: '", s,"'");
if(!ret[0]){throw new Error("Unexpected error (matchStr failed) from "+p.constructor.name||"IREGEX");}return p.minChars();}},{key:"minCharsList",value:function minCharsList(flag){//if( !flag ) throw new Error("flag should be true");
return this.matcher.minCharsList(flag);}},{key:"emptyAt",value:function emptyAt(ix){var tracker=this.getInputTracker();if(ix<tracker.length)return(0,_incrRegexV.isHolder)(tracker[ix][0]);return false;}},{key:"match",value:function match(ch){/* public */this._resetCache();var ret=this.matcher.match(ch);this.fixTracker();return ret;}},{key:"matchStr",value:function matchStr(str){/* public */this._resetCache();var ret=this.matcher.matchStr(str);this.fixTracker();return ret;}},{key:"state",value:function state(){/* public */return this.matcher.state();}},{key:"fixed",value:function fixed(){return this.matcher.fixed();}},{key:"reset",value:function reset(){/* public */this.matcher.reset();this._resetCache();return this;}},{key:"clone",value:function clone(){return new RxMatcher(this.matcher.clone());}},{key:"getInputTracker",value:function getInputTracker(){//if( this._tracker === undefined ) 
//	this._tracker = this.matcher.tracker;//this.matcher.getInputTracker();  
//return this._tracker; 
return this.matcher.tracker;}},{key:"getFullTracker",value:function getFullTracker(){var t=this.getInputTracker();var rest=this.matcher.minChars().map(function(c){return(0,_incrRegexV.isMeta)(c)?[c,undefined]:[c,c];});//return append(t,rest);
return[].concat(t,rest);}},{key:"_resetCache",value:function _resetCache(){//this._tracker = undefined;
this._lastEditableIndex=undefined;}},{key:"stateStr",value:function stateStr(){return this.matcher.stateStr();}},{key:"length",get:function get(){return this.matcher.length;}}]);return RxMatcher;}();