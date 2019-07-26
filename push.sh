#!/usr/bin/env bash

npm run build
fis3 release --root=./dist --file=./fis-conf.js static
fis3 release --root=./example --file=./fis-conf.js html
