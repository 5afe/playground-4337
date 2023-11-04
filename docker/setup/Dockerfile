FROM docker.io/library/node:18

WORKDIR /src/playground

COPY package.json package-lock.json .
RUN npm ci

COPY contracts contracts
COPY hardhat.config.js .
RUN npm run compile

COPY scripts scripts
COPY src src

ENTRYPOINT ["npm", "run"]
CMD ["setup"]
