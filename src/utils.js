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


"use strict";


export function assign(object) {
    if (!object) {
        return object;
    }
    for (var argsIndex = 1, argsLength = arguments.length; argsIndex < argsLength; argsIndex++) {
        var iterable = arguments[argsIndex];
        if (typeof iterable === 'function' || (typeof iterable === 'object' && iterable !== null)) {
            var index = -1, keys = Object.keys(iterable),
                length = keys ? keys.length : 0, prop;
            while (++index < length) {
                prop = keys[index];
                object[prop] = iterable[prop];
            }
        }
    }
    return object;
}

export function copy(obj) { return assign({},obj); }

export function extend(protoProps, staticProps) {
    var Parent = this, Child;
    if (typeof Parent !== 'function') throw new Error('Parent must be a constructor function');

    if (has(protoProps, 'constructor')) {
        Child = protoProps.constructor;
    } else {
        Child = function(){ return Parent.apply(this, arguments); };
    }

    assign(Child, Parent, staticProps);

    // subclass extends superclass
    Child.prototype = Object.create(Parent.prototype);
    if (protoProps) assign(Child.prototype, protoProps);

    Child.prototype.constructor = Child;
    //Child.__super__ = Parent.prototype;

    return Child;
}


export const contract = (function() {
  const call = Function.prototype.call;
  const slice = call.bind([].slice);
  const getClassName = call.bind({}.toString);

  // A contract that allows anything

  const isUndef = function(x) { return (typeof x == 'undefined'); };
  const NVL= function(v,dflt) { return isUndef(v)? dflt: v; }
  const any = function(x) {
      return x;
  };
  const isClassOf = function(s) {
      var TYPE = "[object " + s + "]";
      return function(v) {
          return (getClassName(v) == TYPE);
      };
  };


  const classOf = function(s) {
      var TYPE = "[object " + s + "]";
      return function(v) {
          if (getClassName(v) !== TYPE) {
              throw new TypeError("Expected " + s);
          }
          return v;
      };
  };

  const isArr = isClassOf("Array");


  // Manditory contract
  const arr = classOf("Array");

  const isTypeOf = function(s) {
      return function(v) {
          return (typeof v == s);
      };
  };

  // Creates a contract for a value of type s
  const typeOf = function(s) {
      return function(v) {
          if (typeof v !== s) {
              throw new TypeError("Expected a" + (s === "object" ? "n" : "") + s + ".");
          }
          return v;
      };
  };

  //Manditory contract
  const func = typeOf("function");
  const isFunc = isTypeOf("function");

  // Creates a contract for an object inheriting from ctor
  const instanceOf = function(ctor) {
      return function(inst) {
          if (!(inst instanceof ctor)) {
              throw new TypeError("Expected an instance of " + ctor);
          }
          return inst;
      };
  };

  const int32 = function(n) {
      if ((n | 0) !== n ) {
          throw new TypeError("Expected a 32-bit natural.");
      }
      return n;
  };

  // Asserts int32 and nonnegative
  const nat32 = function(n) {
      if ((n | 0) !== n || n < 0) {
          throw new TypeError("Expected a 32-bit natural.");
      }
      return n;
  };

  return {
    int32, nat32,
    func, isFunc,
    typeOf, isTypeOf,
    arr, isArr,
    classOf, isClassOf,
    instanceOf, 
    isUndef
  };
})();

export function ID(x) { return x; }
export function flatten(anArray) {
  var newArray = [];
  return newArray.concat.apply(newArray, anArray);
}

export function array_eq(array, another) {
    // if the other array is a falsy value, return
    if( array === another ) return true;
    if (!array || !another)
        return false;

    // compare lengths - can save a lot of time 
    if (another.length !== array.length)
        return false;

    for (let i = 0, l=another.length; i < l; i++) {
        // Check if we have nested arrays
        if (another[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array_eq(array[i], another[i]))
                return false;       
        }           
        else if (another[i] !== array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

export function array_match(array, subArray, at) {
    // if the other array is a falsy value, return
    if (!array || !subArray)
        return false;
    let len = array.length;
    let lenS = subArray.length;
    if( at+lenS > len ) return false; // cannot match subArray too long 

    for (let i = at, l=lenS, j=0; j < lenS; i++,j++) {
        // Check if we have nested arrays
        if (subArray[j] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array_match(array[i], subArray[j],0))
                return false;       
        }           
        else if (array[i] !== subArray[j]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

export function array_append(arr, list) {
  for(let i=0; i< list.length; i++) arr.push(list[i]);
  return arr;
}

// Handy string utilities

export function sreverse(s) {
  var o = [];
  for (var i = 0, len = s.length; i <= len; i++)
    o.push(s.charAt(len - i));
  return o.join('');
}

// Find the prefix of two strings,
//    s1 = prefix + rest_of_s1;
//    s2 = prefix + rest_of_s2
//    sprefix(s1,s2) === prefix
export function sprefix(s1,s2) {
  let i = 0;
  for(; i< s1.length && i < s2.length; i++) {
    if(s1.charAt(i) !== s2.charAt(i)) return s1.substring(0,i);
  }
  return s1.length < s2.length?s1:s2;
}

// Find the prefix of two strings,
//    s1 = s1_start + post;
//    s2 = s2_start + post;
//    rprefix(s1,s2) === post
export function rprefix(s1,s2) { return sreverse(sprefix(sreverse(s1),sreverse(s2))); }

// s  = head + rest_of_s 
// n  = head.length
// shead(s,n) === head
export function shead(s,n) { return s.length < n ? s : s.substr(0,n); }

// s  = start_od_s + tail 
// n  = tail.length
// stail(s,n) === tail
export function stail(s,n) { return s.length < n ? s : s.substr(s.length-n,n); }

//  s1 = start_of_s1 + end
//  s2 = end + rest_of_s2
//  sRightMerge(s1,s2) === start_of_s1 + s2
//  where: end is the longet string that satisfies the relationship above
export function sRightMerge(s1,s2) {
    let n = Math.min(s1.length,s2.length);
    function match(s1,s2,n) { 
            for(let i=s1.length-n, j=0; j<n; i++, j++) 
              if( s1.charAt(i) !== s2.charAt(j)) return false;
            return true; 
    }
    for(let i = n; i>0; i--) {
      if(match(s1,s2,i)) return s1.substr(0,s1.length-i)+s2;
    }
    return s1+s2;
}

// Polyfill Object.assign
if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}


/* REGEXP TOKENIZER HELPERS */
export const TOKINIZATION_RX = makeRegexp();

function makeRegexp() {
  //var unicode = "\\u[0-9a-fA-F]{2,4}";
  var t = "\\[(?:\\\\]|[^\\]])*\\]";
  var meta = "[.\\]|)]|\\(\\?:|\\(|\\?\\?|\\?|\\*\\?|\\*|\\+\\?|\\+";
  var escaped = "\\\\(?:"+meta + "|" + "[dDsSbBwW\\[{}\\]])";
  var group ="\\{[0-9]+(?:,[0-9]*)?\\}";
  var nonMeta = "[^.+?{}\\]\\[|()]";
  var regexp1 = [ /*unicode,*/ t, group, escaped, meta, nonMeta ].join("|");
  return new RegExp("(" + regexp1 + ")","g");
}



export function parseMulti(str) {
  var m = str.match(/\{(\d+)(,(\d*))?\}/);  // handles { 3 }, { 4, }, {6, 9}
  var low=Number(m[1]);
  return { min: Number(m[1]), max: (m[3]?Number(m[3]):(m[2]?undefined:low)) };
}


export function odd(x) {
    return ((+x)&1) > 0;
  }

// ===========================
// Stack with no duplicates

export class StackDedup {
  constructor(v) {
    this.length = 0;
    this.data = [];
    this.push(v);
    this.maxLen = 0|0;
  }

  forEach(f) {
    let data = this.data;
    for(let i =0; i<this.length; i++) {
       f(data[i],i,this);
    }
    return this;
  }

  reduce(f,iniV) {
    let data = this.data;
    for(let i =0; i<this.length; i++) {
       iniV = f(iniV,data[i],i,this);
    }
    return iniV;
  }


  filter(f) {
    let s = new StackDedup();
    let data = this.data;
    s.maxLen = this.maxLen;
    for(let i =0; i<this.length; i++) {
       if(f(data[i],i,this)) s.push(data[i]);
    }
    return s;
  }

  map(f) {
    let s = new StackDedup();
    let data = this.data;
    s.maxLen = this.maxLen;
    for(let i =0; i<this.length; i++) {
       s.push(f(data[i],i,this));
    }
    return s;
  }

  toArray() {
    return this.reduce( (a,v) => { a.push(v); return a; }, [])
  }

  reset() {
    this.length = 0;
    this.maxLen = 0;
    return this;
  }
  push(v) {
    if( !v ) return this;
    let data = this.data;
    //console.log("TRY DEDUP",this.length);
    let len = this.length;
    for(let i=0; i<len; i++) {
       if(data[i] === v)  {
        //console.log("DEDUP");
        return this;
      }
    }
    data[this.length++] = v;
    if( this.length > this.maxLen) this.maxLen = this.length;
    return this;
 
  }

}


//============================================
// Immutable list implementation

class List_n {
  constructor(l,r) {
    this.head = l;
    this.tail = r;
  }
  equals(b) {
    if( b === null) return false;
    return this.head === b.head && this.tail === b.tail; 
  }
}

export function n_cons(elem, list) {
  return new List_n( elem, list );
}

export function n_head(list) {
  if (!list) throw Error("n_head of empty list");
  return list.head;
}

export function n_tail(list) {
  if (!list) throw Error("n_tail of empty list");
  return list.tail;
}

export function n_reverse(list, nl) {
  nl = nl || null;
  if (!list) return nl;
  return n_reverse(n_tail(list), n_cons(n_head(list), nl)); // simple tail recursion
}

export function arrayToList(array) {
  return n_reverse(array.reduce( (a, b) => n_cons(b, a), null));
}

export function stringToList(str)  {  return arrayToList(str.split("")); }
export function listToArray(list)  {  return n_reduce(list, (a, b) => { a.push(b); return a; }, []); }
export function listToString(list) {  return listToArray(list).join(''); }

export function n_concat(list1, list2) {
  if (!list1) return list2;
  return (!list1) ? list2  
                  : n_cons(n_head(list1), n_concat(n_tail(list1), list2));
}

export function n_map(list, fn, i) {
  i = i || 0;
  return !list ? list 
               : n_cons(fn(n_head(list), i, list), n_map(n_tail(list), fn, i + 1));
}

export function n_filter(list, fn, i) {
  if (!list) return list;
  i = i || 0;
  if (fn(n_head(list), i, list)) return n_cons(n_head(list), n_filter(n_tail(list), fn, i + 1));
  return n_filter(n_tail(list), fn, i + 1);
}

export function n_reduce(list, fn, base) {
  return (!list) ? base 
                 : n_reduce(n_tail(list), fn, fn(base, n_head(list))); // simple tail recursion
}

export function n_removeAll(list, listOfItemsToRemove, eq) {
  if (!eq) { eq = (a, b) =>   a == b; }
  const inListFn = ((a) => n_reduce(listOfItemsToRemove, ((b, e) => b && !eq(a, e)),  true));
  return n_filter(list, inListFn);
}
 
// stringToList, listToArray, listToString, n_cons, n_head, n_tail, n_filter, n_reduce, n_map, n_concat, n_removeAll 