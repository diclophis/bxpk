#!/bin/bash

set -e
set -x

#BIND_MOUNT_PUBLIC_DIR="--mount type=bind,source=$(pwd)/buffer,target=/var/tmp/app/buffer"

docker build -f Dockerfile.jruby -t bxpk:latest-jruby . 2>&1 > /dev/null
docker build -f Dockerfile -t bxpk:latest . 2>&1 > /dev/null

if [ ! -e buffer/32-basic.json ];
then
  docker run --cpus=1 --rm bxpk:latest bin/mkbox 32 basic > buffer/32-basic.json
  docker run --cpus=1 --rm bxpk:latest bin/mkbox 1024 voxels > buffer/1024-voxels.json
  docker run --cpus=1 --rm bxpk:latest bin/mkbox 2000 voxels > buffer/2000-voxels.json
  docker run --cpus=1 --rm bxpk:latest bin/mkbox 1024 > buffer/1024-random.json
  docker run --cpus=1 --rm bxpk:latest bin/mkbox 8 > buffer/8-random.json
fi

time docker run --cpus=10 -i --rm bxpk:latest-jruby bin/bxpk 32 8 --shuffle < buffer/1024-random.json > public/rendering-jruby.json
time docker run --cpus=10 -i --rm bxpk:latest bin/bxpk 32 8 --shuffle < buffer/1024-random.json > public/rendering-mri.json
