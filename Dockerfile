FROM node:17

RUN apt-get update && apt-get install -y git node-typescript

WORKDIR /klaytn-net-intelligence-api

ADD . .

RUN git submodule update --init --remote

WORKDIR /klaytn-net-intelligence-api/lib/klaytnjs-monorepo/packages/utils
RUN npm install -g typescript@next && \
    npm install --save-dev @types/node && \
    npm install

WORKDIR /klaytn-net-intelligence-api
RUN (cd lib/klaytnjs-monorepo/packages/devp2p && \
    npm install && \
    npm run build)

RUN npm install && \
    npm install -g pm2

CMD pm2 start app.json && pm2 logs 0