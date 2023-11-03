FROM docker.io/library/node:18

RUN git clone --depth=1 https://github.com/eth-infinitism/bundler /src/bundler
WORKDIR /src/bundler

RUN yarn && yarn preprocess
