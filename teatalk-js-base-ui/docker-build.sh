#!/usr/bin/env bash
version=`date +%Y%m%d%H%M%S`;
echo "build webim version $version"
npm run build:prod

docker rm `docker ps -a -q`

docker rmi --force `docker images | grep webim | awk '{print $3}'`
docker rmi --force `docker images | grep none | awk '{print $3}'`

docker build -t webim:$version ./docker


docker tag webim:$version 10.10.208.193:5000/webim:$version
#
docker push 10.10.208.193:5000/webim:$version


echo "build webim success 10.10.208.193:5000/webim:$version"
