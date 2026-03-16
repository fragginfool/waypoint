#!/bin/bash

# Usage: ./deploy.sh <tag>
# Example: ./deploy.sh 1.94

set -e

TAG=${1:-1.94}
IMAGE="gitea.home/josh/waypoint:$TAG"

echo "Building image: $IMAGE"
podman build -t "$IMAGE" .

echo "Pushing image: $IMAGE"
podman push "$IMAGE" --tls-verify=false

echo "Updating Kubernetes deployment..."
kubectl set image -n waypoint deployment/waypoint waypoint="$IMAGE"

echo "Deployment updated to $IMAGE"
