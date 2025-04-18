##STAGE 1: Build ##
#FROM node:16.19.0-bullseye 
FROM node:20.6.0-bullseye
RUN mkdir -p /opt/Docker/node
WORKDIR /opt/Docker/node
COPY package.json  /opt/Docker/node
COPY package-lock.json /opt/Docker/node
COPY swagger.js /opt/Docker/node
COPY swagger_output.json /opt/Docker/node
RUN rm -rf node_modules
RUN npm ci
RUN npm install
RUN npm install ioredis
COPY . .
WORKDIR /opt/Docker/node/src
EXPOSE 3000
EXPOSE 6379
EXPOSE 8443
CMD ["node","app.js"]








