#!/bin/bash

set -e
set -x

bin/mkbox 64 > public/shared/random.json
bin/bxpk 1024 1 --shuffle < public/shared/random.json > public/shared/rendering.json || true
