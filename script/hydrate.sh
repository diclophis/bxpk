#!/bin/bash

set -e
set -x

mkdir buffer

#if [ ! -e buffer/32-basic.json ];
#then
#  docker run --cpus=1 --rm bxpk:latest bin/mkbox 32 basic > buffer/32-basic.json
#  docker run --cpus=1 --rm bxpk:latest bin/mkbox 1024 voxels > buffer/1024-voxels.json
#  docker run --cpus=1 --rm bxpk:latest bin/mkbox 2000 voxels > buffer/2000-voxels.json
#  docker run --cpus=1 --rm bxpk:latest bin/mkbox 1024 > buffer/1024-random.json
#  docker run --cpus=1 --rm bxpk:latest bin/mkbox 8 > buffer/8-random.json
#fi
#time docker run --cpus=10 -i --rm bxpk:latest-jruby bin/bxpk 32 8 --shuffle < buffer/1024-random.json > public/rendering-jruby.json
#time docker run --cpus=10 -i --rm bxpk:latest bin/bxpk 32 8 --shuffle < buffer/1024-random.json > public/rendering-mri.json

#bin/mkbox 1024 > buffer/random.json
#bin/bxpk 32 8 --shuffle < buffer/random.json > public/rendering.json

bin/mkbox 8 > buffer/random.json
bin/bxpk 8 8 --shuffle < buffer/random.json > public/shared/rendering.json
