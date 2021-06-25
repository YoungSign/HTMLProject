#!/usr/bin/env bash
docker stop webim
docker rm webim
docker run -d  --privileged=true -p 8093:8093 --name webim 10.10.208.193:5000/webim:20200116160547
docker logs -f webim
