/** 
 * Copyright (c) 2016, Nurul Choudhury
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 */



export class MultiMask {
	constructor(m1,m2,m3) {
		var list = [m1,m2,m3];
		this.multi = list.map((e) => { return { flag: true, element: e}; });
		this.len  = 0;
		this.raw = '';
	}

	findTrue() {
		var res = this.multi.filter( (e) => e.flag );
		return { flag: res.length > 0, rest: res };
	}

	findLen() {
	  var length = this.length;
	  var res = this.multi.filter( (e) => e.selection.end == length );
	  return { len: res.length, rest: res };
	}

	input(c) {
	   if(someTrue(this.multi,c)) {
		   this.length++;
		   this.raw= this;
		   return true;
	   }
	   return false;
	}

}