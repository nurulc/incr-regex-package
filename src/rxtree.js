//rxtree.js
import {printExpr} from "./rxprint"; 
import {StackDedup} from "./utils";
export function MANY() {}
export function TERM() { }
export function PERHAPS_MORE(){ }
export function BOUNDARY(){ }

export function OP(x, msg) {
  var toStr = function() { return msg || x.val;};
  x.toString = toStr;
  return x;
} 
const MATCH_TRUE = [true,undefined];
const MATCH_FALSE = [false, undefined];

function anych(ch) { return ch !== DONE ?MATCH_TRUE: MATCH_FALSE; }

export const SKIP =         OP({type: 'N', val: "<SKIP>", multi: TERM, op: 'SKIP', match: anych });
export const BS =           OP({type: 'N', val: "\b", multi: TERM,     op: 'SINGLE',   match: __match(/[\b]/) });
export const LP =           OP({type: 'L', val: ')'});
export const RP =           OP({type: 'R', val: ')'});
export const OR =           OP({type: 'B', val: '|', op: 'OR'});
export const ZERO_OR_ONE =  OP({type: 'U', val: "?", op: 'MULTI'});
export const ZERO_OR_MORE = OP({type: 'U', val: "*", op: 'MULTI'});
export const ONE_OR_MORE =  OP({type: 'U', val: "+", op: 'MULTI'});
export const DOT =          OP({type: 'B', val: '.', op: '.'});
export const FALSE =        function() { return false; };

export const ANYCH =       function() { return OP({type: 'N', val: "(.)", multi: MANY, op: 'ANY', match: anych }); };
export const DONE  =        OP({type: 'N', val: "DONE", multi: BOUNDARY, op: 'DONE', match: FALSE }); // cannot match any more
export const MORE  =        OP({type: 'N', val: "MORE", multi: BOUNDARY, op: 'MORE', match: FALSE }); // regex not yet done, more to match
export const MAYBE =        OP({type: 'N', val: "MAYBE", multi: BOUNDARY, op: 'MAYBE', match: FALSE }); // done, but could match more
export const FAILED =       OP({type: 'N', val: "FAILED", multi: BOUNDARY, op: 'FAILED', match: FALSE }); // (should never be here) the pattern does not match

function __match(regexp) {
  return function(ch) { 
  	return !!(ch !== DONE && (ch === undefined || ch.match(regexp)))? MATCH_TRUE: MATCH_FALSE };
}

const _stdRegexp = { "\\d": __match(/\d/), 
                     "\\D": __match(/\D/), 
                     "\\s": __match(/\s/), 
                     "\\S": __match(/\S/), 
                     "\\w": __match(/\w/), 
                     "\\W": __match(/\W/) };

export function stdRxMeta(str) {
	return {type: 'N', val: str, multi: MANY, op: 'SPECIAL-CHARSET',match: _stdRegexp[str]};
}
export function makeCharSet(str) {
	return {type: 'N', val: str,  multi: MANY,     op: 'CHARSET', match: __match(new RegExp(str))};
} 



export function matchable(node) {  return node && (!node.oper) && node.multi !== BOUNDARY && node.match ; } // return the matcher function or false
export function boundary(node) {  return node && (!node.oper) && node.multi === BOUNDARY && node.match ; }  // return the matcher function or false
export function dot(exp) { return exp && (exp.oper === DOT); }
export function or(exp) { return  exp && (exp.oper === OR); } 
export function zero_or_one(exp) { return exp && (exp.oper === ZERO_OR_ONE); }
export function zero_or_more(exp) { return exp && (exp.oper === ZERO_OR_MORE); }
export function anychar(exp) { return exp && (exp.type === 'N' && exp.op === 'ANY'); }
export function charset(exp) { return exp && (exp.type === 'N' && (exp.op === 'CHARSET' || exp.op === 'SPECIAL-CHARSET')); }

export  function RX_OP(op, a, b) {
  if( op === DOT ) return RX_CONS(a,b);
  if( op === OR )  return RX_OR(a,b);
  return !b ? a : { oper: op, left: a , right: b};
}

export function RX_UNARY(op,a) {
	return { oper: op, left: a }; 
}

export function RX_CONS(a,b) {
  if( a === SKIP ) return b;
  if( b === SKIP ) return a;
  return !b ? a : { oper: DOT, left: a , right: b}; 
}
export function RX_OR(a,b) { return !b ? a : { oper: OR, left: a , right: b}; }
export function RX_ZERO_OR_MORE(a) { return { oper: ZERO_OR_MORE, left: a }; }
export function RX_ZERO_OR_ONE(a) { return { oper: ZERO_OR_ONE, left: a }; }
export function RX_ONE_OR_MORE(a) { return RX_CONS(a, RX_ZERO_OR_MORE(copyNode(a))); }

export function copyNode(aNode) {
	if( aNode === undefined ) return undefined;
	if( aNode === DONE ) return DONE;
  //if( aNode.type === 'U' ) return {type: 'U', val: aNode.val, op: aNode.op, match: aNode.match};
	if( aNode.type === 'N' && aNode.oper === undefined ) return {type: 'N', val: aNode.val, multi: aNode.multi, op: aNode.op, match: aNode.match};
	if( aNode.left && (dot(aNode) || zero_or_one(aNode) || zero_or_more(aNode) || or(aNode)) ) {
		if( aNode.right ) return { oper: aNode.oper, left: copyNode(aNode.left), right: copyNode(aNode.right)};
		else return { oper: aNode.oper, left: copyNode(aNode.left) };
	}
	throw new Error("Copy of an invalid node " + aNode);
}


// === SOME RegExp tree utils =====

export function makeFSM(t, connector) {
  if( (matchable(t) || boundary(t)) && connector) { // t => t->connector
    t.nextNode = connector;
    return t;
  }
  else if( dot(t) ) { //( . l r) => l->r->connector
    let right = connector? makeFSM(t.right,connector): t.right;
//    if( right && boundary(right) 
//              && connector === DONE ) right = DONE; //  left.(\b.DONE) last thing is a word boundary just remove it
    makeFSM(t.left,right);
    return t;
  }
  else if(or(t) && connector) { // ( | l r) => ( | l->connector  r->connector)
    if( t.left === SKIP ) t.left = connector;
    else makeFSM(t.left, connector);
    if( t.right === SKIP ) t.right = connector;
    else makeFSM(t.right,connector);
    return t;
  }
  else if(zero_or_one(t) && connector) { // ( ? l) => (? l->connector)->connector
    makeFSM(t.left,connector);
    t.nextNode = connector;
    return t;
  }
  else if(zero_or_more(t) && connector) { // ( * l) => (? l->self)->connector
    let self = t;
    makeFSM(t.left,self);
    t.nextNode = connector;
    return t;
  }
  return t;
}

function fixedAt(rxNode) {

  if( !rxNode || rxNode === DONE) return undefined;
  if( dot(rxNode) ) { // this is a node that concat of two regexp /AB/ => dot(A,B) - where A and B are regexp themselves
    return fixedAt(rxNode.left);
  } else if( matchable(rxNode) ) {
      let res = matchable(rxNode)(undefined);
      return res[1]; // undefined if this is not a fixed character
  } else if( or(rxNode) ) { //  /A|B/ => or(A,B)
      let chL = fixedAt(rxNode.left);
      let chR = fixedAt(rxNode.right);
      return  (chL === chR ) ? chL : undefined; // only true if the same char begins bot portions of the OR ( left | right )
  }
  else if(zero_or_one(rxNode) || zero_or_more(rxNode) || boundary(rxNode)) { 
      return undefined; 
  }
  
  return undefined;
}

export function getArrayFixedAt(arr) {
  let c = arr && arr.length >0 ? fixedAt(arr.data[0]) : undefined;
  if( c === undefined ) return undefined;
  return  (arr).reduce((a,b) => (a === fixedAt(b))?a:undefined, c);
}

export function  rxMatch(rxN, ch, lastCh, matchState = new StackDedup()) {
    if(rxN === DONE ) {
      if(ch === DONE) { 
        matchState.push(DONE);
        return DONE; 
      }
      return FAILED;
    }
    else if( dot(rxN) ) {
      return rxMatch(rxN.left,ch, lastCh, matchState);
    }
    else if( or(rxN) ) {
          let rl =  rxMatch(rxN.left,ch, lastCh, matchState);
          let rr =  rxMatch(rxN.right,ch,lastCh, matchState);
          return _result(rl,rr);
    }
    else if(zero_or_one(rxN) || zero_or_more(rxN)) {
          let rl =  boundary(rxN.left)? DONE : rxMatch(rxN.left,ch, lastCh, matchState);
          let rr =  rxMatch(rxN.nextNode,ch, lastCh, matchState);
          return _result(rl,rr);
    }
    else if( matchable(rxN) ) {
       let res = rxN.match(ch);
       if( res[0] ) {
          matchState.push(rxN);
        }
       return res[0]? (rxN.nextNode === DONE? DONE:MORE) : FAILED; 
    }
    else if( boundary(rxN) ) {
      //if( ch === DONE && this.nurul) console.log("boundary",ch)
      if( ch === DONE) return  rxMatch(rxN.nextNode,ch,lastCh, matchState);// ignore the boundary
    
       let res = rxN.match(lastCh,ch);
       if( res[0] || ch === undefined) {
          return  rxMatch(rxN.nextNode,ch,lastCh, matchState);
        }
       return FAILED; 
    }
    return FAILED;
  }


function _result(l,r) {
    if( l === FAILED ) return r;
    if( l === MAYBE  ) return MAYBE;
    if( l === MORE ) return (r === DONE || r === MAYBE)? MAYBE : MORE;
    /*if( l === DONE )*/
        return ( r === MORE || r === MAYBE) ? MAYBE : DONE;
}

// Resturns a list of nodes that Match currState

export function rxMatchArr(ch, lastCh, currState, matchState) {
      matchState = (matchState === undefined || matchState !== currState) ? new StackDedup() : matchState;
      let res = currState.reduce( (res, rxN) => _result(rxMatch(rxN,lastCh,ch,matchState),res), FAILED  );
      if( res === FAILED  || matchState.length === 0) {
        return undefined;
      }
      return matchState;    
}

// immutable function that takes the currentState and generates the next state

export function rxNextState(currState) {
	let len = currState.length;
	let nextState = new StackDedup();
	for(let i =0; i< len; i++) {
		let rxN = currState.data[i];
		nextState.push(rxN === DONE ? DONE : rxN.nextNode);
	}
	return nextState; // destructive change to the state
}


/*
   Given a reg-expr node rxN, can we reach any element in the list rxN in one step.

   This is the typical thing historians do, knowing what happens in the future can we 
   find the decissions we made to get there. 
   We get this issue whe we delete text, let me give a simple example:
   regexp = /Phone: \d{3}-\d{3}-\d{4}|Pack: \d{3}:\d{7}/

   So we can enter something like this
     "Phone: 212-768-1234" or
     "Pack: 789:7654321"

     now suppose we entered: the second "Pack: 789:7654321"
     now we delete the begining of the text:
     "______________321", but we know that the begining should be fixed
     so should be put "Phone: ___...", or "Pack: ___", this is the future problem.
     
     - We know that the text should end in "...321", so what can we tell about the past
     so that we can reach here. Clearly come thing will be some thisgs unknown, but can we deduce
     anything about the past (in out case the prefix string).
     We know that the first letter must be a 'P'
     "P_____________321" so what are out outions
     "Phone: ___-___-"  clearly this is not goin to fit sinece we need a '-' where the '3' has to be
     but:
     "Pack: ___:____"   This case clearly fits. This is a simple exmaple, and a regexp can get very complicated

     This a an attempt to do the best filling details uning the principle of least surprise, but also allow the user
     to edit the input in any legal way without haveing to deleting everything and starting again


     Params:
     	rxN - node in a regexp FSM (finite state machine)
     	rxTargetStateList - the target state we need to reach
*/

function rxCanReach(rxN, rxTargetStateList) {
	if( rxN === DONE ) return false;
    else if( dot(rxN) ) {
      return rxCanReach(rxN.left,rxTargetStateList);
    }
    else if( or(rxN) ) {
          return  (rxCanReach(rxN.left,rxTargetStateList) ||
                   rxCanReach(rxN.right,rxTargetStateList));
    }
    else if(zero_or_one(rxN) || zero_or_more(rxN)) {
          return   rxCanReach(rxN.left,rxTargetStateList) ||
                   rxCanReach(rxN.nextNode,rxTargetStateList);
    }
    else if( boundary(rxN) ) {
      return  rxCanReach(rxN.nextNode,rxTargetStateList); // ignore the boundary
    }
    else if( matchable(rxN) ) {
       if( matchable(rxN.nextNode) ) {
       	   if( rxTargetStateList.contains(rxN.nextNode) )  return rxN;
       	   return undefined;
       }	
       return rxCanReach(rxn.nextNode,rxTargetStateList);
    }
    return undefined;
}

/*

	Given an initial set of possible states, which of those acutually get to the targer state.
	this is the way we determine form a known future state of a regexp match, we can recreate the 
	previous states we could have been in. This is to determine that fixed value that must occur in the 
	previous states

*/

export function rxGetActualStartState(possibleStartState, targetState) {
   return possibleStartState.map(   (rxN) => rxCanReach(rxN, targetState))
                            .filter( a    => a !== undefined);
}



function rxStepArr(lastCh,c, currState) {
	let nextState = undefined;
	if( currState != undefined) {
		let forward = rxNextState(currState);
		nextState = rxMatchArr(forward, c,lastCh);
	}
	return nextState;
}


export function advancedRxMatcher(rxN,str) {
	let state0 = new StackDedup(); 
	let res = rxMatch(rxN, str.charAt(0),state0);
	if(res === FAILED ) return [undefined, undefined, [state0]];
	return str.substr(1).split('').reduce( ([lastCh, currState, res], c) => {
		   let nextState = rxStepArr(lastCh,c,currState);
           res.push(nextState);
		   return [c, nextState, res ]
	}, [str.charAt(0), state0, [state0]]);
}


export const RXTREE = { MANY, TERM, PERHAPS_MORE, BOUNDARY, matchable,boundary,dot,or,zero_or_one,zero_or_more,anychar,charset,OP,
                        SKIP, BS, LP, RP, OR,  ZERO_OR_ONE, ZERO_OR_MORE, ONE_OR_MORE, DOT, FALSE, DONE, MAYBE, MORE, FAILED,
                        RX_OP, RX_UNARY, RX_CONS,RX_OR, RX_ZERO_OR_ONE,RX_ZERO_OR_MORE, RX_ONE_OR_MORE,copyNode, stdRxMeta, 
                        makeCharSet, makeFSM, getArrayFixedAt, rxMatchArr, rxNextState, rxMatch,
                        rxCanReach, rxGetActualStartState, advancedRxMatcher};