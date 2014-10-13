#!/bin/sh

rm -rf "Compiled"
tsc --target "ES5" --outDir "Compiled" "Scripts/Main.ts"
