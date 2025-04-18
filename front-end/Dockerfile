### STAGE 1: Build Angular Application ###
FROM node:16.19.0-bullseye-slim AS builder

RUN mkdir -p /opt/Xlogix/Docker/angular
WORKDIR /opt/Xlogix/Docker/angular

# Install required system packages
RUN apt-get update && apt-get install -y apt-utils sudo
RUN apt-get install -y libpcre3
RUN apt-get install  -y libssl-dev
RUN apt install  -y gcc
RUN apt-get install  -y zlib1g-dev
RUN apt-get install -y libpcre3 libpcre3-dev

# Install Node.js and Angular CLI
RUN npm install -g @angular/cli@16.0.1

# Copy necessary project files
COPY package.json package-lock.json angular.json tsconfig.app.json tsconfig.json tsconfig.spec.json proxy.conf.json /opt/Xlogix/Docker/angular/
COPY . .

# Install project dependencies
RUN npm install
RUN ng build

### STAGE 2: Build MTN-SDK ###
WORKDIR /opt/Xlogix/Docker/angular/mtn-sdk
# Install project dependencies
RUN npm install
RUN ng build
RUN ls -la /opt/Xlogix/Docker/angular/mtn-sdk

### STAGE 3: Create the Final Image with Nginx ###
FROM nginx:latest
#RUN apt-get update
#RUN apt-get install -y libpcre3
#RUN apt-get install  -y libssl-dev
#RUN apt install  -y gcc
#RUN apt-get install  -y zlib1g-dev
#RUN apt-get install -y libpcre3 libpcre3-dev

# Copy NGINX configuration files
#COPY nginx /usr/sbin
#RUN chmod +x /usr/sbin/nginx
COPY nginxdocker /etc/nginx/
COPY letsencryptdocker /etc/

# Copy the built Angular app from STAGE 1
COPY --from=builder /opt/Xlogix/Docker/angular/dist /usr/share/nginx/html
COPY ratelimit.html /usr/share/nginx/html/mtn-zoom

# Copy the built MTN-SDK from STAGE 2
COPY --from=builder /opt/Xlogix/Docker/angular/mtn-sdk/sdk /usr/share/nginx

# Expose the necessary ports
EXPOSE 80
EXPOSE 443
EXPOSE 8443
EXPOSE 81
EXPOSE 6379

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]