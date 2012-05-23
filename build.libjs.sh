#!/bin/sh
awk '
    BEGIN {out=1; nout=0} 
    
    /\/\/##nolibmodestart/ {out=0} 
    /\/\/##nolibmodestop/ {out=1} 
    {if (out == 1) {print $0}}' \
htdocs/rabe.js | sed -e 's/\/\/##nolibmodestop//' 

