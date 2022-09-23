FROM node:17

RUN apt-get update && apt-get install -y git node-typescript
RUN git clone -b main https://github.com/klaytn/klaytn-net-intelligence-api.git && cd klaytn-net-intelligence-api && git submodule update --init

# TODO: packages/utils has problem related to 'Buffer' which is a type used in node.
# I don't know exactly how, but below two lines solved the issue.
WORKDIR /klaytn-net-intelligence-api/lib/klaytnjs-monorepo/packages/utils
RUN npm i -g typescript@next && npm i --save-dev @types/node && npm install

WORKDIR /klaytn-net-intelligence-api/lib/klaytnjs-monorepo/packages/devp2p
RUN npm run build

WORKDIR /klaytn-net-intelligence-api
RUN npm install && npm install -g pm2
