#!/bin/bash

set -e
set -x

docker build -f Dockerfile.jruby -t bxpk:latest-jruby . 2>&1 > /dev/null

docker build -f Dockerfile -t bxpk:latest . 2>&1 > /dev/null

time docker run --cpus=2 -it --rm bxpk:latest-jruby bin/bxpk
time docker run --cpus=2 -it --rm bxpk:latest bin/bxpk
