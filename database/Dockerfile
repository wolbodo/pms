#
# Node.js w/ Bower & Gulp runtime Dockerfile
#
# https://github.com/dockerfile/nodejs-bower-gulp-runtime
#
FROM node
 
WORKDIR /app

# install packages
ADD package.json /tmp/package.json
ADD ./node_modules /app/node_modules

ADD ./build /app/build
ADD server.js /app/server.js

ENV NODE_ENV='production'
ENV VIRTUAL_HOST=pms.dxlb.nl

EXPOSE 80

# Define default command.
# Setup server
CMD ["node", "server.js"]
