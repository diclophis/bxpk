#!/bin/bash

set -e
set -x

BIND_MOUNT_PUBLIC_DIR="--mount type=bind,source=$(pwd)/buffer,target=/var/tmp/app/buffer"

docker build -f Dockerfile.jruby -t bxpk:latest-jruby . 2>&1 > /dev/null
time docker run --cpus=10 -it --rm bxpk:latest-jruby bin/bxpk

docker build -f Dockerfile -t bxpk:latest . 2>&1 > /dev/null
time docker run --cpus=10 -it --rm bxpk:latest bin/bxpk
