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

import { incrRegEx,convertMask,isMeta,isOptional,isHolder                        } from "../incr-regex-v3";
import { RXInputMask, trimHolder  					  } from "../inputmask/RXInputMask";	
import {DONE,MORE,MAYBE,FAILED,/*matchable,dot,or,zero_or_one,zero_or_more, boundary, RxParser,*/ printExpr,printExprN} from '../regexp-parser';
import { expect} from "chai";


    const US = [
        ["AL", "Alabama"],
        ["AK", "Alaska"],
        ["AS", "American Samoa"],
        ["AZ", "Arizona"],
        ["AR", "Arkansas"],
        ["CA", "California"],
        ["CO", "Colorado"],
        ["CT", "Connecticut"],
        ["DE", "Delaware"],
        ["DC", "District Of Columbia"],
        ["FM", "Micronesia"],
        ["FM", "Federated States Of Micronesia"],
        ["FL", "Florida"],
        ["GA", "Georgia"],
        ["GU", "Guam"],
        ["HI", "Hawaii"],
        ["ID", "Idaho"],
        ["IL", "Illinois"],
        ["IN", "Indiana"],
        ["IA", "Iowa"],
        ["KS", "Kansas"],
        ["KY", "Kentucky"],
        ["LA", "Louisiana"],
        ["ME", "Maine"],
        ["MH", "Marshall Islands"],
        ["MD", "Maryland"],
        ["MA", "Massachusetts"],
        ["MI", "Michigan"],
        ["MN", "Minnesota"],
        ["MS", "Mississippi"],
        ["MO", "Missouri"],
        ["MT", "Montana"],
        ["NE", "Nebraska"],
        ["NV", "Nevada"],
        ["NH", "New Hampshire"],
        ["NJ", "New Jersey"],
        ["NM", "New Mexico"],
        ["NY", "New York"],
        ["NC", "North Carolina"],
        ["ND", "North Dakota"],
        ["MP", "Mariana Islands"],
        ["MP", "Northern Mariana Islands"],
        ["OH", "Ohio"],
        ["OK", "Oklahoma"],
        ["OR", "Oregon"],
        ["PW", "Palau"],
        ["PA", "Pennsylvania"],
        ["PR", "Puerto Rico"],
        ["RI", "Rhode Island"],
        ["SC", "South Carolina"],
        ["SD", "South Dakota"],
        ["TN", "Tennessee"],
        ["TX", "Texas"],
        ["UT", "Utah"],
        ["VT", "Vermont"],
        ["VI", "Virgin Islands"],
        ["VA", "Virginia"],
        ["WA", "Washington"],
        ["WV", "West Virginia"],
        ["WI", "Wisconsin"],
        ["WY", "Wyoming"]
    ];

    const emails = "[a-zA-Z_0-9][a-zA-Z_.0-9-]*@([a-zA-Z_0-9][a-zA-Z_.0-9-]*)+"
    const states = US.map(a => "(" +a[0] +"-"+a[1]+"|"+a[1]+"-"+a[0]+")").join("|");
    const ssn = "Ssn: \\d{3}-\\d{2}-\\d{4}";
    const ext = "( Ext: \\d{1,4})?";
    const phonebase = "(\\+\\d{1,3} )?\\(\\d{3}\\)-\\d{3}-\\d{4}";
    const phone = "Phone: "+phonebase+ext;
    const hwc_phone = "(Home: |Cell: )" + phonebase + "|Work: "+phonebase+ext;
    const zip = "Zip: \\d{5}(-\\d{4})?";
    const creditcard = "CC: (\\d{4}-){3}\\d{4} exp: (0\\d|1[012])/\\d{2}";
    



  function _skipFixed(aPattern, onlyFixed) {
    let s = aPattern.minChars();
    onlyFixed = !!onlyFixed;
    if( /*onlyFixed !== true &&*/ s.length > 1 && isOptional(s.charAt(0)) && !isMeta(s.charAt(1)) ) {
      if (aPattern.match(s.charAt(1))) return true; 
    }
    else if( /* onlyFixed === true && */ s.length >= 1 && !isMeta(s.charAt(0))) return aPattern.match(s.charAt(0));
    return false;
  }


  function _skipAndMatch(aPattern, ch) {
    if(aPattern.match(ch)) {
       //console.log("GOOD",c);
       return true;	
    } 
    
    let c = aPattern.minChars();
    if( !isMeta(c.charAt(0))  ) {
    	//console.log("fixed: (",c,")");
    }
    let backup = aPattern.clone();
    while( _skipFixed(aPattern,false) ) {
      if( aPattern.match(ch) ) return true;
    }
    aPattern.reset();
    aPattern.matchStr(_after(backup,true,0));
    return false;
  }

  function  _after(aPattern, all, ix) { /* public */ // get the input matched so far after ix.
      let tracker = aPattern.getInputTracker(); 
       if(!ix) {
           let al = all?tracker:tracker.filter( e => e[1] === undefined);
           return al.map(e => e[0] ).join('');
       } else {
           let al = tracker.filter( (e,i) => i>= ix && (all || e[1] === undefined));
           return al.map(e => e[0] ).join('');
       }      
  } 

  function SEL(low,high) { return { start: low, end: high}; }

describe("RXInputMask Basic", () => { 


	function ins(rxi, str) {for(var i=0; i<str.length; i++) { rxi.input(str.charAt(i));	} return rxi; }
    describe("Simple RxInputMask input testing", () =>{
// Example of use from the test cases
//
    let rxi = new RXInputMask({pattern: /aa[a-zA-Z]+@@\d+!!/ });
		it("1. pattern /aa[a-zA-Z]+@@\\d+!!/ - add 'aabcd' - expect aaaabcd", () =>{
 			expect(rxi !== undefined).to.be.true;
 			var r =  ins(rxi,"aabcd");
 			expect(rxi._getValue()).to.deep.equal("aaaabcd");
 			expect(rxi.selection).to.deep.equal({start: 7, end: 7});
 			
 			 			
 		});
 		it("2. pattern /aa\[a-zA-Z]+@@\\d+!!/ - ins(aabcdeFG - expect(aaaabcdeFG)", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			var r =  ins(rxi,"aabcdeFG");
 			expect(rxi._getValue()).to.deep.equal("aaaabcdeFG");
 			expect(rxi.selection).to.deep.equal({start: 10, end: 10});
 			 			
 		});
 		it("3. pattern /aa[a-zA-Z]+@@\\d+!!/ add 'bcdefg' - (expect aabcdefg) then add 'xyz' at pos 3 expect(aabxyzcdefg)", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg');
 			expect(rxi._getValue()).to.deep.equal("aabcdefg");
 			rxi.selection.start = rxi.selection.end = 3;
 			ins(rxi,"xyz");
 			expect(rxi._getValue()).to.deep.equal("aabxyzcdefg");
 			expect(rxi.selection).to.deep.equal({start: 6, end: 6});
 			 			
 		});

 		it("4. pattern /aa[a-zA-Z]+@@\\d+!!/ add 'bcdefg@@12' expect'aabcdefg@@12' then add 'xyz' at pos 3", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg@@12');
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12");
 			rxi.selection.start = rxi.selection.end = 3;
 			ins(rxi,"xyz");
 			expect(rxi._getValue()).to.deep.equal("aabxyzcdefg@@12");
 			expect(rxi.selection).to.deep.equal({start: 6, end: 6});
 			 			
 		});
 		it("5. pattern /aa[a-zA-Z]+@@\\d+!!/ add 'bcdefg12' expect 'aabcdefg@@12' then add 'xyz' at pos 3..6", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg12');
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12");
 			//rxi.select(3,6); //"cde"
 			rxi.selection.start = 3; rxi.selection.end = 6;
 			ins(rxi,"xyz");
 			expect(rxi._getValue()).to.deep.equal("aabxyzfg@@12");
 			expect(rxi.selection).to.deep.equal({start: 6, end: 6});
 			 			
 		});
 		it("6. pattern /aa[a-zA-Z]+@\\d+!!/ add 'bcdefg' - expect 'aabcdefg' then skipFixed expect 'aabcdefg@@'", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg');
      expect(rxi._getValue()).to.deep.equal("aabcdefg");
 			rxi.skipFixed(false);
 			rxi.skipFixed(true);
 			expect(rxi._getValue()).to.deep.equal('aabcdefg@@');
 		});
 		it("7. pattern /aa[a-zA-Z]+@\\d+!!/ add 'aabcdefg12' then expect 'aabcdefg@@12'", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg12');
 			expect(rxi._getValue()).to.deep.equal('aabcdefg@@12');
 			expect(rxi.selection).to.deep.equal({start: 12, end: 12});
 			 			
 		});
 		it("8. pattern /aa[a-zA-Z]+@@\d+!!/ add 'bcdefg@@12!' expect('aabcdefg@@12!!') then selsect pos 4,10 ('defg@@1') input 'xyz' one character at a time ", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg@@12!');
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			rxi.select(4,11);
      rxi.input('x');
      expect(rxi._getValue()).to.equal(convertMask("aabcx@@2!!"));
 			expect(rxi.selection).to.deep.equal({start: 5, end: 5});
      //console.log("Regex:", rxi.pattern.matcher," selection:",rxi.selection);
      //console.log("current:", rxi.pattern.matcher.current," selection:",rxi.selection);
      rxi.input('y');
      expect(rxi.selection).to.deep.equal({start: 6, end: 6});
      expect(rxi._getValue()).to.equal(convertMask("aabcxy@@2!!"));
      
      rxi.input('z');
      expect(rxi.selection).to.deep.equal({start: 7, end: 7});
 			//ins(rxi,"xyz");
 			expect(rxi._getValue()).to.equal(convertMask("aabcxyz@@2!!"));
 			expect(rxi.selection).to.deep.equal({start: 7, end: 7});
 			 			
 		});

 		it("9. PASTE pattern /aa[a-zA-Z]+@\\d+/ add 'aabcdefg@12' then add 'xyz' at pos ", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg@@12!!');
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			rxi.select(4,11);
 			//rxi.selection.start = 4; rxi.selection.end = 10;
 			rxi.paste('xyz');
 			expect(rxi._getValue()).to.deep.equal("aabcxyz@@2!!");
 			//expect(rxi.selection).to.deep.equal({start: 7, end: 7});
 			 			
 		});
 		it("10. backspace pattern /aa[a-zA-Z]+@@\\d+/ add 'aabcdefg@12' backspace at characte 4..4 ", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg@@12!!');
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			rxi.select(4,4);
 			rxi.backspace();
 			expect(rxi._getValue()).to.deep.equal("aabdefg@@12!!");
 			expect(rxi.selection).to.deep.equal({start: 3, end: 3});

 			 			
 		});
 		it("11. backspace and undo pattern /aa[a-zA-Z]+@@\\d+/ add 'aabcdefg@12' backspace at characte 4..4 ", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg@@12!!');
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			rxi.select(4,4);
 			rxi.backspace();
 			expect(rxi._getValue()).to.deep.equal("aabdefg@@12!!");
 			expect(rxi.selection).to.deep.equal({start: 3, end: 3});
 			rxi.undo();
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			expect(rxi.selection).to.deep.equal({start: 4, end: 4});
 			 			
 		});
 		it("12. backspace and undo pattern /aa[a-zA-Z]+@@\\d+/ add 'aabcdefg@12' backspace at characte 3..5 ", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg@@12!!');
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			rxi.select(3,5);
 			rxi.backspace();
 			expect(rxi._getValue()).to.deep.equal("aabefg@@12!!");
 			expect(rxi.selection).to.deep.equal({start: 3, end: 3});
 			rxi.undo();
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			expect(rxi.selection).to.deep.equal({start: 3, end: 5});
 			 			
 		});
 		it("13. backspace and undo pattern /aa[a-zA-Z]+@@\\d+/ add 'aabcdefg@12' backspace at characte 2..12 then undo ", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			ins(rxi,'bcdefg@@12!!');
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			rxi.select(2,14);
 			rxi.backspace();
 			expect(rxi._getValue()).to.deep.equal("aa");
 			expect(rxi.selection).to.deep.equal({start: 2, end: 2});
 			rxi.undo();
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			expect(rxi.selection).to.deep.equal({start: 2, end: 14});
 			 			
 		});
 		it("14. backspace and undo pattern /aa[a-zA-Z]+@@\\d+!!/ add 'aabcdefg@12' backspace at characte 2..12 then undo ", () =>{
 			rxi = new RXInputMask({pattern: /aa[a-zA-Z]+@@\d+!!/ });
 			expect(rxi.getValue()).to.deep.equal(convertMask("aa_*@@_*!!"));
 			ins(rxi,'bcdefg@@12!!');
      //console.log(convertMask("aa_*@@_*!!"));
 			rxi.pattern.minChars();
 			//console.log(rxi.pattern," MinChars: ", rxi.pattern.minChars());
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			rxi.select(2,14);
 			rxi.backspace();
 			expect(rxi.getValue()).to.deep.equal(convertMask("aa_*@@_*!!"));
 			expect(rxi.getRawValue()).to.deep.equal("");
 			expect(rxi.selection).to.deep.equal({start: 2, end: 2});
 			rxi.undo();
 			expect(rxi.pattern.minChars()).to.deep.equal("");
 			//console.log(rxi.pattern);
 			expect(rxi.getRawValue()).to.deep.equal("bcdefg@12!");
 			expect(rxi._getValue()).to.deep.equal("aabcdefg@@12!!");
 			expect(rxi.selection).to.deep.equal({start: 2, end: 14});
 			 			
 		});

    });

	describe("Fixed RxInputMask input testing", () =>{
// Example of use from the test cases
//
        let rxi = new RXInputMask({pattern: /\(\d{3}\)-\d{3}-\d{4}/ });
        it("0. Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ 1", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			var r =  ins(rxi,"9");
 			expect(rxi.getValue()).to.equal(convertMask("(9__)-___-____"));
 			expect(rxi.selection).to.deep.equal({start: 2, end: 2});
 			ins(rxi,"4");
 			expect(rxi.getValue()).to.equal(convertMask("(94_)-___-____"));
 			expect(rxi.selection).to.deep.equal({start: 3, end: 3});
 			rxi.select(2,2);
 			ins(rxi,"1");
 			expect(rxi.getValue()).to.equal(convertMask("(914)-___-____"));
 			expect(rxi.selection).to.deep.equal({start: 3, end: 3});
 		});
		it("1. Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ 1", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset()
 			var r =  ins(rxi,"9147359843");
 			expect(rxi._getValue()).to.equal(convertMask("(914)-735-9843"));
 			expect(rxi.selection).to.deep.equal({start: 14, end: 14});
 		});
 		it("2 Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ delete (1,4)", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			var r =  ins(rxi,"9147359843");
 			rxi.select(1,4);
 			rxi.backspace()
 			expect(rxi.getValue()).to.equal(convertMask("(735)-984-3___"));
 			expect(rxi.selection).to.deep.equal({start: 1, end: 1});
 		});
 		it("2a Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ delete (1,4)", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			var r =  ins(rxi,"147359843");
 			expect(rxi._getValue()).to.equal(convertMask("(147)-359-843"));
 			expect(rxi.getRawValue()).to.equal(convertMask("147359843"));
 			rxi.select(1,1);
 			ins(rxi,'9');
 			expect(rxi._getValue()).to.equal(convertMask("(914)-735-9843"));
 			rxi.select(1,4);
 			rxi.backspace()
 			expect(rxi.getValue()).to.equal(convertMask("(735)-984-3___"));
 			expect(rxi.selection).to.deep.equal({start: 1, end: 1});
 		});
 		it("3 Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ delete (1,4) insert 914552", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			var r =  ins(rxi,"9147359843");
 			rxi.select(1,4);
 			rxi.backspace()
 			expect(rxi.getValue()).to.equal(convertMask("(735)-984-3___"));
 			expect(rxi.getRawValue()).to.equal(convertMask("7359843"));
 			ins(rxi,"9");
 			expect(rxi._getValue()).to.equal(convertMask("(973)-598-43"));
 			ins(rxi,"87");
 			expect(rxi._getValue()).to.equal(convertMask("(987)-735-9843"));
 			expect(rxi.selection).to.deep.equal({start: 6, end: 6});
 		});
 		it("5 Fixed pattern /\\(\\d{3}\)-\\d{3}-\\d{4}/ delete (6,10) insert 9147359843", () =>{
 			expect(rxi !== undefined).to.be.true;
 			rxi.reset();
 			var r =  ins(rxi,"9147359843");
 			rxi.select(6,10);
 			rxi.backspace();
 			//console.log(rxi.pattern);
      expect(rxi.selection).to.deep.equal({start: 6, end: 6});
 			expect(rxi.getValue()).to.equal(convertMask("(914)-984-3___"));
 			expect(rxi.selection).to.deep.equal({start: 6, end: 6});
 			expect(rxi.getRawValue()).to.equal(convertMask("9149843"));
 			expect(rxi.getRawValueAt(6)).to.equal(convertMask("9843"));
 			ins(rxi,"7");
 			expect(rxi._getValue()).to.equal(convertMask("(914)-798-43"));
 			expect(rxi.selection).to.deep.equal({start: 7, end: 7});
 			ins(rxi,"16");
 			expect(rxi._getValue()).to.equal(convertMask("(914)-716-9843"));
 			expect(rxi.selection).to.deep.equal({start: 10, end: 10});
 		});
 	});

 	describe("Check MaskedInput behavior", () =>{
// Example of use from the test cases
//
        let rxi = new RXInputMask({pattern: /\d{4}-\d{4}/ });
        it("0. Fixed pattern /\\d{4}-\\d{4}", () =>{
     			expect(rxi !== undefined).to.be.true;
     			rxi.reset();
     			expect(rxi.pattern.minChars()).to.equal(convertMask("____-____"));
     			var r =  ins(rxi,"1");
     			expect(rxi.getValue()).to.equal(convertMask("1___-____"));
     			expect(rxi.pattern.minChars()).to.equal(convertMask("___-____"));
     
     			expect(rxi.selection).to.deep.equal({start: 1, end: 1});
     			rxi.setValue(convertMask("1___-____"));
     			expect(rxi.getValue()).to.equal(convertMask("1___-____"));
     			expect(rxi._getValue()).to.equal(convertMask("1"));
     			rxi.setValue(convertMask("12__-____"));
     			expect(rxi._getValue()).to.equal(convertMask("12"));
     			//console.log(rxi);
     			expect(rxi.getValue()).to.equal(convertMask("12__-____"));
     			expect(rxi.pattern.minChars()).to.equal(convertMask("__-____"));
     			rxi.setValue(convertMask("12__-____"));
     			expect(rxi.getValue()).to.equal(convertMask("12__-____"));
     			rxi.setValue(convertMask("123_-____"));
     			expect(rxi.getValue()).to.equal(convertMask("123_-____"));
     			expect(rxi.pattern.minChars()).to.equal(convertMask("_-____"));
     			rxi.setValue(convertMask("123_-____"));
     			expect(rxi.getValue()).to.equal(convertMask("123_-____"));
     			rxi.setValue(convertMask("1234-____"));
     			expect(rxi.getValue()).to.equal(convertMask("1234-____"));
     			rxi.setValue(convertMask("1234-____"));
     			expect(rxi.getValue()).to.equal(convertMask("1234-____"));
     			//console.log(rxi.pattern);
     			expect(rxi.pattern.minChars()).to.equal(convertMask("-____"));
     			_skipAndMatch(rxi.pattern, '5');
     			expect(rxi.getValue()).to.equal(convertMask("1234-5___"));
     			rxi.setValue(convertMask("1234-5___"));
     			expect(rxi.getValue()).to.equal(convertMask("1234-5___"));
 			
 		});
    });
    describe("Check MaskedInput behavior backspace", () =>{
        let rxi = new RXInputMask({pattern: /\d{4}-\d{4}/ });
        it("0. Fixed pattern /\\d{4}-\\d{4}", () =>{
   			expect(rxi !== undefined).to.be.true;
   			rxi.reset();
   			var r =  ins(rxi,"1");
   			expect(rxi.getValue()).to.equal(convertMask("1___-____"));
   			expect(rxi.pattern.minChars()).to.equal(convertMask("___-____"));
   			rxi.setSelection(SEL(1,1));
   			expect(rxi.selection).to.deep.equal({start: 1, end: 1});
   			rxi.setValue(convertMask("1___-____"));
   			expect(rxi.pattern.getFirstEditableAtOrAfter(0)).to.equal(0);
   			let start=rxi.selection.start, end=rxi.selection.end;
   			expect(start).to.equal(end);
   			expect(rxi.pattern.getFirstEditableAtOrBefore(start-1)).to.equal(0);
              end = 1;
   			rxi.backspace();
   			expect(rxi._getValue()).to.equal("");
   			
   		});
    });

    describe("Check MaskedInput complex regex", () =>{
        let rxi = new RXInputMask({pattern: /\+\(\d{3}\)-\d{3}-\d{4}|#\d{3}\.\d{3}X?YZ| ?\d{3}---\d{4}\./ });
        it("0. Fixed pattern /\\+\\(\\d{3}\\)-\\d{3}-\\d{4}|#\\d{3}\.\\d{3}X?YZ| ?\\d{3}---\\d{4}\\./", () =>{
      expect(rxi !== undefined).to.be.true;
      rxi.reset();
      var r =  ins(rxi,"1");
      //console.log(rxi.minCharsList());
      expect(rxi.getValue()).to.equal(convertMask("1__---____."));
      expect(rxi.pattern.minChars()).to.equal(convertMask("__---____."));
      rxi.setSelection(SEL(1,1));
      expect(rxi.selection).to.deep.equal({start: 1, end: 1});
      rxi.setValue(convertMask("1__---____."));
      expect(rxi.pattern.getFirstEditableAtOrAfter(0)).to.equal(0);
      let start=rxi.selection.start, end=rxi.selection.end;
      expect(start).to.equal(end);
      expect(rxi.pattern.getFirstEditableAtOrBefore(start-1)).to.equal(0);
      end = 1;
      rxi.backspace();
      rxi.reset();
      ins(rxi,"+914735984");
      expect(rxi.getValue()).to.equal(convertMask("+(914)-735-984_"));
      rxi.setSelection(SEL(0,1));
         //console.log("****** tracker: ", rxi.pattern.getInputTracker());
      expect(rxi.pattern.getFirstEditableAtOrAfter(0)).to.equal(0);
   
      expect(rxi.selection.end).to.equal(2);
      expect(rxi.isDone()).to.equal("MORE");
      expect(rxi.pattern.getFirstEditableAtOrAfter(rxi.selection.end)).to.equal(2);
      
    });
    });
    describe("Check MaskedInput complex regex- minCharsList", () =>{
        let rxi = new RXInputMask({pattern: /To|Be|Or|Not|Zo(12|23?)? be/ });
        //rxi = new RXInputMask({pattern: /To/ });
        it("0. Fixed pattern /To|Be|Or|Not|Zo(123)? be/", () =>{
            expect(rxi !== undefined).to.be.true;
            expect(rxi.pattern.matcher.current.length).to.equal(1);
            expect(rxi.minCharsList(true)).to.deep.equal(['To',"Be",'Or', 'Not', 'Zo be','Zo12 be', 'Zo2 be', 'Zo23 be'].map(convertMask));
            
        });
        it("1. Fixed pattern /To|Be|Or|Not|Zo(123)? be/", () =>{
            expect(rxi !== undefined).to.be.true;
            expect(rxi.pattern.matcher.current.length).to.equal(1);
            expect(rxi.minCharsList()).to.deep.equal(['To',"Be",'Or', 'Not', 'Zo? be'].map(convertMask));
            
        });
        let rxi1 = new RXInputMask({pattern: /To|Be|Or|Not|Zo(23[a-z])* be/ });
        it("2. Fixed pattern /To|Be|Or|Not|Zo[a-z]* be/", () =>{
            expect(rxi1 !== undefined).to.be.true;
            expect(rxi1.pattern.matcher.current.length).to.equal(1);
            expect(rxi1.minCharsList(true)).to.deep.equal(['To',"Be",'Or', 'Not', 'Zo be', 'Zo23a\u0332* be'].map(convertMask));
            
        });
    });
    //complexRx
    describe("Check MaskedInput complex regex- minCharsList", () =>{
        let rxi = new RXInputMask({ pattern: new RegExp([states,ssn,phone,zip,creditcard, "Email: " + emails].join("|"))});
        //rxi = new RXInputMask({pattern: /To/ });
        it("0. Fixed pattern /To|Be|Or|Not|To[a-z]* be/", () =>{
      expect(rxi !== undefined).to.be.true;
      var r =  ins(rxi,"a");
      //console.log(rxi.minCharsList());
      expect(rxi.pattern.matcher.current.length).to.equal(10);
      expect(rxi.minCharsList(true)).to.deep.equal(['AL-Alabama',
                                                'Alabama-AL',
                                                'AK-Alaska',
                                                'Alaska-AK',
                                                'AS-American Samoa',
                                                'American Samoa-AS',
                                                'AZ-Arizona',
                                                'Arizona-AZ',
                                                'AR-Arkansas',
                                                'Arkansas-AR' ]);
      
    });
    });
});


