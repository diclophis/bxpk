#!/bin/bash

set -e
set -x

#BIND_MOUNT_PUBLIC_DIR="--mount type=bind,source=$(pwd)/buffer,target=/var/tmp/app/buffer"

docker build -f Dockerfile.jruby -t bxpk:latest-jruby . 2>&1 > /dev/null
docker build -f Dockerfile -t bxpk:latest . 2>&1 > /dev/null

kubectl delete pod -l app=bxpk --wait=false

kubectl get pods -l app=bxpk
