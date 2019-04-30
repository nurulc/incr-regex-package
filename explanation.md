# A brief expalanation of incr-regex

All avaliable regexp packages treat matching as single matching function, for example the javascript built-in regexp, you either matche the entire
regexp or you fail. This package provides a more flexible approach will return one of 4 states

| Status | Description |
| ------ | ----        |
| DONE | String matches completely |
| OK  | The regexp matches, but will accept more characters, for example a zip code may be 5
 digits or 9 digits  |
| PARTIAL | The regexp matches the string so far but is incomplete, i.e. needs more characters |
| FAIL | The string does not match the regexp |

----

### Example
using the zipcode exmple 
___[0-9]{5}-[0-9]{4}___ :

| String | Status |
| ------ | ----   |
| "90" | _PARTIAL_ |
| "90210" | _OK_ |
| "90210-5" | _PARTIAL_ |
| "90210-5003" | _DONE_ |
| "90210-500A" | _FAIL_ |
