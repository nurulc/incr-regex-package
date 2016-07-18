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

import { expect} from "chai";
import {DONE,MORE,MAYBE,FAILED,matchable,dot,or,zero_or_one,zero_or_more, RxParser, printExpr, printExprN} from '../regexp-parser';
import { incrRegEx,RX                         } from "../incr-regex-v3";	

//import {describe} from "mocha";



describe("regexp tests", () => {
	const comp = ['^', 't', 'o', '\\(', '(', '[^1-5az]', '|', '[^\\]12]', ')', '\\d', ')', '$'];
    const compStr = comp.join('');
    
    
 	describe("parser", () => {
 		it("regexp  ab", () =>{
 			//
 			let t = RxParser.parse("ab");
 			expect(printExprN(t)).to.equal("(a.(b.<DONE>))");
 			
 		});
 		it("regexp  \\w{3,4}", () =>{
 			//
 			let t = RxParser.parse("\\w{3,4}");
 			expect(printExprN(t)).to.equal("(\\w.(\\w.(\\w.((\\w?).<DONE>))))");
 			
 		});
 		it("regexp  \\W{3,4}\\d{2,2}", () =>{
 			//
 			let t = RxParser.parse("\\W{3,4}\\d{2,2}");
 			expect(printExprN(t)).to.equal("(\\W.(\\W.(\\W.((\\W?).(\\d.(\\d.<DONE>))))))");
 			
 		}); 		
 		it("regexp or a|b", () =>{
 			//
 			let t = RxParser.parse("a|b");
 			expect(printExpr(t)).to.equal("((a|b).<DONE>)");
 			expect(dot(t)).to.be.true;
 			expect(or(t.left)).to.be.true;
 			
 		});
 		it("tokenizes x*", () =>{
 			//
 			let t = RxParser.parse("a*");
 			expect(printExpr(t)).to.equal("((a*).<DONE>)");
 			expect(dot(t)).to.be.true;
 			expect(zero_or_more(t.left)).to.be.true;
 			
 			
 		});
 		it("tokenizes /.\\ba*/", () =>{
 			//
 			let t = RxParser.parse(".\\ba*");
 			expect(printExpr(t)).to.equal("(((.).(\\b.(a*))).<DONE>)");
 			expect(dot(t)).to.be.true;
 			//expect(zero_or_more(t.left)).to.be.true;
 			
 			
 		});

 	});
    describe("regex parser", () => {
    	it("tokenizes abc", () =>{
 			//
 			let t = RxParser.parse("abc");
 			expect(printExpr(t)).to.equal("((a.(b.c)).<DONE>)");
 			expect(dot(t)).to.be.true;
 			
 			
 		});

    	it("tokenizes (abc+)|b*|d", () =>{
 			//
 			let t = RxParser.parse("(abc+)|b*|d");
 			expect(printExpr(t)).to.equal("(((a.(b.(c.(c*))))|((b*)|d)).<DONE>)");
 			expect(or(t.left)).to.be.true;
 			expect(dot(t.left.left)).to.be.true;
 			
 			
 		});
 		it("tokenizes x{0,}", () =>{
 			//
 			let t = RxParser.parse("x{0,}");
 			expect(printExprN(t)).to.equal("((x*).<DONE>)");
 			
 		});
 		it("tokenizes x{1,}", () =>{
 			//
 			let t = RxParser.parse("x{1,}");
 			expect(printExpr(t)).to.equal("((x.(x*)).<DONE>)");
 			//expect(or(t.left)).to.be.true;
 			//expect(dot(t.left.left)).to.be.true;
 			
 		});
 		it("tokenizes x{3,}", () =>{
 			//
 			let t = RxParser.parse("x{3,}");
 			expect(printExpr(t)).to.equal("((((x.x).x).(x*)).<DONE>)");
 			//expect(or(t.left)).to.be.true;
 			//expect(dot(t.left.left)).to.be.true;
 			
 		});

 	});

	describe("regex parserN", () => {
    	it("tokenizes abc", () =>{
 			//
 			let t = RxParser.parse("abc");
 			expect(printExprN(t)).to.equal("(a.(b.(c.<DONE>)))");
 			expect(dot(t)).to.be.true;
 		});

    	it("tokenizes (abc+)|b*|d", () =>{
 			//
 			let t = RxParser.parse("(abc+)|b*|d");
 			expect(printExprN(t)).to.equal("((a.(b.(c.((c*).<DONE>))))|(((b*).<DONE>)|(d.<DONE>)))");
 			expect(or(t.left)).to.be.true;
 			expect(dot(t.left.left)).to.be.true;
 			
 			
 		});
 		it("tokenizes x{0,}", () =>{
 			//
 			let t = RxParser.parse("x{0,}");
 			expect(printExprN(t)).to.equal("((x*).<DONE>)");
 			
 		});
 		it("tokenizes x{1,}", () =>{
 			//
 			let t = RxParser.parse("x{1,}");
 			expect(printExprN(t)).to.equal("(x.((x*).<DONE>))");
 			//expect(or(t.left)).to.be.true;
 			//expect(dot(t.left.left)).to.be.true;
 			
 		});
 		it("tokenizes x{3,}", () =>{
 			//
 			let t = RxParser.parse("x{3,}");
 			expect(printExprN(t)).to.equal("(x.(x.(x.((x*).<DONE>))))");
 			
 		});
 		it("tokenizes /|a|b/", () =>{
 			//
 			let t = RxParser.parse("|a|b");
 			expect(printExpr(t)).to.equal("((<DONE>|(a|b)).<DONE>)");
 			
 		});
 		it("tokenizes /||a||b/", () =>{
 			//
 			let t = RxParser.parse("||a||b");
 			expect(printExpr(t)).to.equal("((<DONE>|(a|(<DONE>|b))).<DONE>)");
 			
 		});
 		it("tokenizes /a|b|/", () =>{
 			//
 			let t = RxParser.parse("a|b|");
 			expect(printExpr(t)).to.equal("((a|(b|<DONE>)).<DONE>)");
 			
 		});
 		it("tokenizes /a()b/", () =>{
 			//
 			let t = RxParser.parse("a()b");
 			expect(printExpr(t)).to.equal("((a.b).<DONE>)");
 			
 		});
 		it("tokenizes /a()()+b/", () =>{
 			//
 			let t = RxParser.parse("a()b");
 			expect(printExpr(t)).to.equal("((a.b).<DONE>)");
 			
 		});
  		it("tokenizes /a()/", () =>{
 			//
 			let t = RxParser.parse("a()");
 			expect(printExpr(t)).to.equal("(a.<DONE>)");
 			
 		});
 		it("tokenizes /a()/", () =>{
 			//
 			let t = RxParser.parse(/a()/);
 			expect(printExpr(t)).to.equal("(a.<DONE>)");
 			
 		});

 	});

});
