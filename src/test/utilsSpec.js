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

import {n_head, n_cons, StackDedup,n_tail, n_concat,n_reverse, n_removeAll, n_reduce, arrayToList, listToArray, n_filter, odd, TOKINIZATION_RX} from "../utils";
import { expect} from "chai";
//import {describe} from "mocha";



const AL = arrayToList;
const LA = listToArray;

describe("regex tests", () => {
	const comp = ['^', 't', 'o', '\\(', '(', '[^1-5az]', '|', '[^\\]12]', ')', '\\d', ')', '$'];
    const compStr = comp.join('');
    
    
 	describe("tokenizer a regexp - '"+compStr+"'", () => {
 		it("tokenizes regexp", () =>{
 			var list = compStr.match(TOKINIZATION_RX);
 			expect(list).to.deep.equal(comp);
 		})
 	});
});

describe("list manipulation", () => {
   describe("n_cons, n_head, n_tail, n_append, n_filter, listToArray, arrayToList", () => {
       it("construct a single item", () => {
       	   let result = n_cons('a', null); 
           expect(n_head(result)).to.equal('a');
           expect(result).to.have.a.property("head", 'a');
           expect(result).to.have.a.property("tail", null);

       });

       it("construct a composite list", () => {
       	   let rest = n_cons('b', null);
           let result = n_cons('a1', rest); 
           expect(n_head(result)).to.equal('a1');
           expect(n_tail(result)).to.equal(rest);
           expect(result).to.have.a.property("head", 'a1');
           expect(result).to.have.a.property("tail", rest);

       });
       it("construct a long list", () => {
       	    let ix = (list, i) => i===0 ? n_head(list): ix(n_tail(list),i-1);
			  let res = "a,b,c,d".split(",").reduce( (a,b) => n_cons(b,a), null);
   			expect(ix(res,0)).to.equal('d');
   			expect(ix(res,1)).to.equal('c');
   			expect(ix(res,2)).to.equal('b');
   			expect(ix(res,3)).to.equal('a');
   			//expect(listToArray(res)).to.deep.equal(['d','c','b','a']);
   			//expect(listToArray(n_reverse(res)).to.deep.equal("a,b,c,d".split(","));
       });
 	   it("array operations on list", () => {
       	 	let res = "a,b,c,d".split(",").reduce( (a,b) => n_cons(b,a), null);
 			expect(LA(res)).to.deep.equal(['d','c','b','a']);
 			expect(LA(n_reverse(res))).to.deep.equal( "a,b,c,d".split(",") );
       });

       it("filter a list - using odd", () => {
			let res = AL([1,2,3,4,5,6,7,8,9,10]);
 			    expect(LA(n_filter(odd,res))).to.deep.equal([1,3,5,7,9]);
       });
       it("concat list", () => {
			   let first = AL([1,2,3]);
			   let second = AL([4,5,6,7,8,9,10]);
 			   expect((LA(n_concat(first,second)))).to.deep.equal([1,2,3,4,5,6,7,8,9,10]);
       });
   });
   describe("n_reduce, n_removeall", () => {
	  let list1_to_5 = AL([1,2,3,4,5]);
   	  
 /*  	  it("n_reduce", () =>{

		  let res  = n_reduce( (a,b) => a+b, list1_to_5,  0);
	   	  expect(res).to.equal(15);
	   	  expect(n_reduce((a,b) => a+b, list1_to_5,  "")).to.equal("12345");
   	  }); */

   	  it("n_removeAll", () =>{
    	  	let r3_4 = AL([3,4]);
			    let r3_4_5 = AL([3,4,5]);
			    let empty = null;

     	    expect(LA(n_removeAll(list1_to_5, r3_4  ))).to.deep.equal([1,2,5]);
  		    expect(LA(n_removeAll(list1_to_5, r3_4_5))).to.deep.equal([1,2]);

  		    
   	  });
   	  it("n_removeAll - all, and empty",() =>{
   	  	    const empty = null;
   	  		expect(listToArray(n_removeAll(list1_to_5,empty))).to.deep.equal(listToArray(list1_to_5));
  		    expect(n_removeAll(list1_to_5,list1_to_5)).to.equal(null);
   	  });
   });
});


describe("Stack Opertations", () => {
   let result = "1 2 3 4 5 6".split(" ").map(e => Number(e)); 
   let s = new StackDedup();
   let stack = (result) => result.reduce( (s,e) => s.push(e), new StackDedup());
   describe("create a stack", () => {
       it("create a list from a stack", () => {
           expect(result).to.deep.equal([1,2,3,4,5,6]);
           s = stack(result);
           expect(s.data[0]).to.equal(1);
           expect(s.data[5]).to.equal(6);

           expect(s.data).to.deep.equal([1,2,3,4,5,6]);
           expect(s).to.have.a.property("length", 6);
           s.push(6);
           expect(s.data).to.deep.equal([1,2,3,4,5,6]);
           expect(s).to.have.a.property("length", 6);

       });

       it("initialize StackDedup", () => { 
          s = new StackDedup(1);
          
           expect(s.data[0]).to.equal(1);
           let sum = s.reduce( (s,v) => s+v,0);
           expect(sum).to.deep.equal(1);
       });
       
       it("map StackDedup", () => { 
          s = stack(result);
          
           expect(s.data[0]).to.equal(1);
           let sum = s.reduce( (s,v) => s+v,0);
           expect(sum).to.deep.equal(21);
       });
       it("convert to array", () => {
          let s2 = stack(result).filter( x => (x % 2) == 0);
          expect(s2.toArray()).to.deep.equal([2,4,6]);
       });
 
   });
 
   describe("n_reduce, n_removeall", () => {
    let list1_to_5 = AL([1,2,3,4,5]);
      
      it("n_reduce", () =>{

      let res  = n_reduce((a,b) => a+b, list1_to_5,  0);
        expect(res).to.equal(15);
        expect(n_reduce((a,b) => a+b, list1_to_5,  "")).to.equal("12345");
      });

      it("n_removeAll", () =>{
          let r3_4 = AL([3,4]);
          let r3_4_5 = AL([3,4,5]);
          let empty = null;

          expect(LA(n_removeAll(list1_to_5, r3_4  ))).to.deep.equal([1,2,5]);
          expect(LA(n_removeAll(list1_to_5, r3_4_5))).to.deep.equal([1,2]);

          
      });
      it("n_removeAll - all, and empty",() =>{
            const empty = null;
          expect(listToArray(n_removeAll(list1_to_5,empty))).to.deep.equal(listToArray(list1_to_5));
          expect(n_removeAll(list1_to_5,list1_to_5)).to.equal(null);
      });
   });
});