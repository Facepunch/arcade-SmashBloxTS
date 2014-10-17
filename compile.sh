#!/bin/sh

rm -rf "Compiled"
tsc --target "ES5" --outDir "Compiled" "Main.ts"
