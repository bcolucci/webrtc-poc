#!/bin/sh

docker build -t webrtc-poc-server .
docker run -p 3001:3001 --name webrtc-poc-server -d webrtc-poc-server
