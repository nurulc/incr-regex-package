
$ find -name "*.js" | xargs wc -l | sed "s,\\./,pre-," | sed "s/\\.js\$//"

cat <<====
   564 pre-incr-regex-v3
    69 pre-index
   604 pre-inputmask/RxInputMask
    46 pre-MultiMask
   438 pre-regexp-parser
   241 pre-RxMatcher
    92 pre-rxprint
   420 pre-rxtree
   586 pre-test/indexSpec
   235 pre-test/regexp-parserSpec
   559 pre-test/rxinputmaskSpec
   162 pre-test/simpleRegExSpec
   180 pre-test/utilsSpec
    14 pre-testideas
   591 pre-utils
====

find -name "*.js" | xargs wc -l | sed "s,\\./,pre-," | sed "s/\\.js\$//"  | grep " pre-" | sed 's,^[^0-9]*,{value: ,'
