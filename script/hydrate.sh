#!/bin/bash

set -e
set -x

bin/mkbox 8 > public/shared/random.json
bin/bxpk 4096 4 --shuffle < public/shared/random.json > public/shared/rendering.json
