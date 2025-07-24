#!/bin/bash

set -e

if [[ $1 != "dev" && $1 != "live" ]]; then
  echo 'Usage: ./docker-push.sh (dev|live) [<release-version>]; <release-version> is "latest" by default'
  exit 0
fi;

IMAGE_TAG="${2:-"latest"}"
if [[ $1 = "dev" ]]; then
  IMAGE_TAG="$IMAGE_TAG-rc"
fi;

aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 291889421067.dkr.ecr.ap-northeast-2.amazonaws.com

docker buildx build --platform linux/amd64 -t 291889421067.dkr.ecr.ap-northeast-2.amazonaws.com/scc-admin-frontend:$IMAGE_TAG --build-arg="NEXT_PUBLIC_DEPLOY_TYPE=$1" .
docker push 291889421067.dkr.ecr.ap-northeast-2.amazonaws.com/scc-admin-frontend:$IMAGE_TAG
