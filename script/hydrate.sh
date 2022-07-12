#!/bin/bash

set -e
set -x

bin/mkbox 8 > public/shared/random.json
bin/bxpk 4192 64 --shuffle < public/shared/random.json > public/shared/rendering.json
