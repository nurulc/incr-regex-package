# incr-regex-package
A node package for incremental regular expression parsing in JavaScript; useful for input validation. In particular it was to provide a more standard way to support [masked input](https://github.com/insin/react-maskedinput). Firstly, I would like to say that the ''Masked Input'' package is very nice and I really like it. I only found the method of defining input mask rather limited. The package has nice documentation and I highly recommed you look at it. It would have been nice if the mask could be defined using a regular expression. That turns out to be hard, becuase regular exxpression will match the entire input after you haave entered it, but I have found no way to check the input as you are typing it in, check if the partial string matches the regular expression.

_Some of the other future possibilities with the package:_

1. Generate string that will match a regular expression. This is very useful for generating sample strings from a regular expression
2. Support for a smart regex tester
3. Create railroad diagrams from a regular expression
4. Creating regex not from strings but programatically, for example using a fluent API
 
Perhaps something like this:
```JavaScript
   var exp = RX.or("hello","goodbye","hi")
                .opt(" my freind")
                .zeroOrMore(
                   RX.chars(
                        "[a-zA-Z]", 
                        RX.except("[aeiouAEIO]")
                        )
                  );
   // same as
   var rx1 = /(hello|goodbye|hi)(my friend)?[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTUVWXYZ]*/
````

### Installation

  npm install incr-regexp-package --save

### Sample index.js file

```JavaScript
var ir = require("incr-regex-package").default;

var incrRegEx = ir.incrRegEx;
var rx = ir.incrRegEx("ab[1-10]c");
var DONE = ir.DONE;
var MORE = ir.MORE;
var MAYBE = ir.MAYBE;
var FAILED = ir.FAILED;

console.log("Initial input mask: ", rx.minChars()); // Print the pseudo input msak for the regexp
console.log("matchStr:", rx.matchStr("ab"),
	        '\nState: '+rx.state(), 
	         '\nInput Mask left: "'+rx.minChars()+'"');
```

**The output:**

_Initial input mask:_  **ab_c**<br>
_matchStr:_ **[ true, 2, 'ab' ]**<br>
_State:_ **MORE**<br>
_Input Mask left:_ **"_c"**<br>




### What is supported

Almot everything supported by JavaScript regexp. With some notable differences:

_Note:_ All regular expressions have an implicit:

* ^  at the beigining of the xepression 
* $  at the end of the expression
    
Although ( ) and (?: )  are supported, but neither do input binding _\(number)_ e.g _\1_. This feature is not required for the main usecase for the package.
    
Look **ahead** is not supported 

_Regular JavaScript_
```JavaScript
	var rx = /\d{3}-\d{3}-\d{4}/
```

_In the incremental regex package_

```JavaScript
	var irx = incrRegEx("\\d{3}-\\d{3}-\\d{4}");
```

### Testing

I have an initial series of test, but they are by no means comprehensive. I am hoping to significantly augment the tests in the near future. So far all the tests are successful but are mostly small. I have done one simple rather pathelogical test with 40,000 characters. But this is way beyon the use case for the package. But it does demonstrate that the package is fairly robust. I will write up the design of the package in the wiki. 

Although regular expression processing looks simple at first glance, bit I have been written selveral in my career and one in college. It is very easy to introduce subtle bugs. I cannot guarantee that this package has no major bugs, but expreience and testing seems to indicate that the remaining bugs are come extreme corner cases. So far the experience is good. I somone id will to take all the JavaScript test cases and try with this package it would be bost helpful.

The package is relatively small and it makes use of javascript's regular expression processing under the hood, mostly in the parser and for single character tests. As I said before, JavaScript regular expression is the method of choice for text processing 

```JavaScript
import { DONE, MORE, FAILED, incrRegEx } from 'incr-regex-package'
// Example of use from the test cases
//
		it("incrRegEx  /abc/", () =>{
 			expect(incrRegEx !== undefined).to.be.true;
 			var r =  incrRegEx("abc");
			var res = [ r.matchStr('abc') , r.state() ]
 			expect(res).to.deep.equal([[true, 3,'abc'],DONE]);
 			// r.matchStr('abc') === [true, 3, 'abc']
 			// r.state()         === DONE

 			 			
 		});
 		it("Test minChars functionality /abd|abd?/ new",() =>{
 			var r =  incrRegEx("abd|abd?");
 			expect(r.minChars()).to.equal('ab');   // minimal string that will match the regexp
 			 			
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
 		it("incrRegEx or /abc|abdc*/ new", () =>{
 			expect(incrRegEx !== undefined).to.be.true;
 			var r =  incrRegEx("abc|abdc*");
 			expect(r.minChars()).to.equal("ab_");
```

### Justification for the project
JavaScript has excellent regular expression support, so why create another one? It definately will not be as fast or as feature rich as the built-in support. 
Well, there is one compelling reason, input validation; and in particular how can we use a regular expression to validate the input as the user is typing in the text. It is easy to use standard regular expression to validate input after you have filled in the input field. Let me give an example, suppose you want to check an email address; so you use a regular expression for the 
input field, the regular expression will only validate after you have entered the entire email address, but will not tell you is valid as you are typing it in. For example if you have  entered ***nurulc@abc*** 
a second ***@***, *for example:* ***nurulc@abc@*** is not allowed. Another example may help, a phone number

`/\d{3}-\d{3}-\d{4}/` is the validation regexp.

if you type: ***1234*** I should not be able to enter that, since the input would never validate. While if I enter ***123-*** this is valid upto that point in the input. Ofcourse if you leave the input box, what you have entered is not a
complete match and will show that this is not a valid phone number. The second case is handled perfertly by the standard JavaScript regular expression, but not
while you are entering the data.

## The API

* **match(** _ch_ : _char_ **)** : boolean
* **matchStr(** _str_ : _String_**)** : Array _[ success: boolean, matchCount: integer, matchedStr: String]_
* **toString()** : String 
* **getAllInput()** : String
* **minChars()** : String
* **reset()** : void
* **copy()** : RegExp