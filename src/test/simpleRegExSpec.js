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

import { incrRegEx,convertMask                        } from "../incr-regex-v3";	
import {DONE,MORE,MAYBE,FAILED,/*matchable,dot,or,zero_or_one,zero_or_more, boundary, RxParser,*/ printExpr,printExprN} from '../regexp-parser';
import { expect} from "chai";

describe("regexp incremental V2", () => {

    describe("simple regexp test V2", () =>{
// Example of use from the test cases
//
		it("incrRegEx1  /\d{1,3}/", () =>{
 			expect(incrRegEx !== undefined).to.be.true;
 			var r =  incrRegEx("\\d{1,3}");
			var res = [ r.matchStr('12') , r.state() ]
 			expect(res).to.deep.equal([ [true, 2,'12'] ,MAYBE]);
 			// r.matchStr('abc') === [true, 2, '12']
 			// r.state()         === MORE
 			 			
 		});
 		it("incrRegEx1  /\\w{3,4}\\./", () =>{
 		expect(incrRegEx !== undefined).to.be.true;
 			var r =  incrRegEx("\\w{3,4}\\.");
			var res = [ r.matchStr('Nur') , r.state() ]
 			expect(res).to.deep.equal([ [true, 3,'Nur'] ,MORE]); // needs more characters before we are done
 			// r.matchStr('abc') === [true, 3, 'Nur']
 			// r.state()         === MORE
 			 			
 		});
 		it("incrRegEx1  /\\W{3,4}\\d{2,3}/", () =>{
 		expect(incrRegEx !== undefined).to.be.true;
 			var r =  incrRegEx("\\W{3,4}\\d{2,3}");
			var res = [ r.matchStr('+-%42') , r.state() ]
 			expect(res).to.deep.equal([ [true, 5,'+-%42'] ,MAYBE]); // We have enough characters, but we can add more
 			expect(r.minChars()).to.equal(convertMask('?')); // we have reached the minimum requirement
 			// r.matchStr('abc') === [true, 3, 'Nur']
 			// r.state()         === MORE
 			 			
 		}); 
 		it("incrRegEx1  /\\W{3,4}\\d{2,3}/", () =>{
 			expect(incrRegEx !== undefined).to.be.true;
 			var r =  incrRegEx("\\W{3,4}\\d{2,3}");
			var res = [ r.matchStr('+-%') , r.state() ]
 			expect(res).to.deep.equal([ [true, 3,'+-%'] ,MORE]); // We have enough characters, but we can add more
 			expect(r.minChars()).to.equal(convertMask('?__?')); // we have reached the minimum requirement
 			// r.matchStr('abc') === [true, 3, 'Nur']
 			// r.state()         === MORE
 			 			
 		}); 		
 		it("Test minChars functionality /abd|abd?/ new",() =>{
 			var r =  incrRegEx("abd|abd?");
 			expect(r.minChars()).to.equal(convertMask('ab?'));   // minimal crring that will match the regexp
 			 			
 		});
 		it("incrRegEx test incremental matching => /abc|abd/ ", () =>{
 			expect(incrRegEx !== undefined).to.be.true;
 			var r =  incrRegEx("abc|abd");
			var res = [ r.match('a') , r.match('b'),  r.state() ]
 			expect(res).to.deep.equal([true,true,MORE]);
 			//
 			// Match some more
			res = [ r.match('d'),  r.state() ]
 			expect(res).to.deep.equal([true,DONE]);
 			 			
 		});
 		
    });
});

	    

