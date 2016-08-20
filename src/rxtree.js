//rxtree.js


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


export const RXTREE = { MANY, TERM, PERHAPS_MORE, BOUNDARY, matchable,boundary,dot,or,zero_or_one,zero_or_more,anychar,charset,OP,
                        SKIP, BS, LP, RP, OR,  ZERO_OR_ONE, ZERO_OR_MORE, ONE_OR_MORE, DOT, FALSE, 
                        RX_OP, RX_UNARY, RX_CONS,RX_OR, RX_ZERO_OR_ONE,RX_ZERO_OR_MORE, RX_ONE_OR_MORE,copyNode, stdRxMeta, makeCharSet, makeFSM };