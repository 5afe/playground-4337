FROM docker.io/library/node:18

RUN git clone https://github.com/eth-infinitism/bundler /opt/bundler
WORKDIR /opt/bundler

RUN yarn && yarn preprocess
ENTRYPOINT ["yarn", "bundler"]
CMD []
