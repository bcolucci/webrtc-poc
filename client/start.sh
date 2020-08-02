#!/bin/sh

docker build -t webrtc-poc-client .
docker run -p 8080:8080 --name webrtc-poc-client -d webrtc-poc-client
