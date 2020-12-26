# WebRTC_demo
## Needs package:
1. express
2. serve-index peer
>They will be installed by npm
## OS: Ubuntu

- [WebRTC_demo](#webrtc_demo)
  - [Needs package:](#needs-package)
  - [OS: Ubuntu](#os-ubuntu)
  - [Build this app, Step by step](#build-this-app-step-by-step)
    - [Open server](#open-server)
    - [Close server](#close-server)
  - [Use Dockerfile to build this app](#use-dockerfile-to-build-this-app)
## Build this app, Step by step
```bash
1. $sudo su
2. $apt-get update
3. $apt-get upgrade
4. $apt-get install nodejs
5. $apt-get install npm
#If you want to check the versions of nodejs and npm,then you should use following instructions
# $node -v       
# $npm -v
6. In the /home/ubuntu, clone this repo
$git clone https://github.com/XPPGX/WebRTC_demo.git
7. $cd WebRTC_demo
8. $mkdir key
9. $cd key
10. $openssl genrsa -out server.key
11. $openssl req -new -key server.key -out server.csr
#In 11th step, you should press enter continually until you met the normal command line status.
12. $openssl x509 -req -days 9999 -in server.csr -signkey server.key -out server.crt
#So far, There should be three files in your floder named key, files types are following: server.key , server.csr , sercer.crt
13. $cd ..
14. $npm install serve-index peer
15. $npm install express
```
### Open server
> Under WebRTC_demo folder, use following instruction:
> ```bash
> $node server.js
> #Now you can go to the chrome and use the https://{IP}:81 to watch out the result
> ```
### Close server
> Just press Ctrl and c, in the command line should be like this
> ```bash
> $^c
> ```

## Use Dockerfile to build this app
```bash
1. $sudo apt-get install docker.io
2. $sudo usermod -aG docker ubuntu
# Reconnect with ssh to server
3. $cd WebRTC_demo
4. $docker build -t pp .
#you have created a image named "pp", the "." in the above line is important
5. $docker run -d -p 81:81 -p 9000:9000 pp
#you have create a container with the image named "pp", and the 81 and 9000 ports of this container is connected with the 81 and 9000 ports of server.

#Now you can go to the chrome and use the https://{IP}:81 to watch out the result
```