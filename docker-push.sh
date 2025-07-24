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

aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/q0g6g7m8

docker buildx build --platform linux/amd64 -t public.ecr.aws/i6n1n6v2/scc-admin-frontend:$IMAGE_TAG --build-arg="NEXT_PUBLIC_DEPLOY_TYPE=$1" .
docker push public.ecr.aws/i6n1n6v2/scc-admin-frontend:$IMAGE_TAG
