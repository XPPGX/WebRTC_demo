FROM ubuntu:20.04
MAINTAINER XPPGX

RUN apt-get update -y &&\
    apt-get upgrade -y &&\
    apt-get install nodejs -y &&\
    apt-get install npm -y &&\
    apt-get install git -y &&\
    apt-get install openssl -y &&\
    git clone https://github.com/XPPGX/WebRTC_demo.git &&\
    cd WebRTC_demo &&\
    mkdir key &&\
    cd key &&\
    openssl genrsa -out server.key &&\
    echo "\n\n\n\n\n\n\n\n\n\n" | openssl req -new -key server.key -out server.csr &&\
    openssl x509 -req -days 9999 -in server.csr -signkey server.key -out server.crt &&\
    cd .. &&\
    npm install express &&\
    npm install serve-index peer

WORKDIR /WebRTC_demo

CMD ["node","server.js"]