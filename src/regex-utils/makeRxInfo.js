import {n_head, n_tail} from "../utils";
import { matchable,boundary,dot,or,zero_or_one,zero_or_more, DONE, 
         HOLDER_ZERO_OR_MORE, HOLDER_ANY, HOLDER_ZERO_OR_ONE } from "../rxtree";

export default function makeRxInfo(unit, addElem, merge, optional, mapper) {
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
        else return getRxInfo(rxNode.nextNode,addElem(prefix,HOLDER_ZERO_OR_MORE),optStop);
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
