FROM node AS BUILD_IMAGE

RUN curl -sfL https://gobinaries.com/tj/node-prune | bash -s -- -b /usr/local/bin

WORKDIR /app

COPY . /app/

# use your entrypoint or command to run an intermediate script
ENTRYPOINT ["sh", "bin/start.sh"]

# trying to access npmjs to see what happened
RUN curl -v https://registry.npmjs.com/

RUN node --max-old-space-size=256
# install 
RUN npm install 

# build
RUN npm run build

# remove development dependencies
RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune

FROM node:alpine

WORKDIR /app

# copy from build image
COPY --from=BUILD_IMAGE /app/dist ./dist
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

ENV DEBUG msteams

EXPOSE 3007

CMD [ "node", "dist/server.js" ]