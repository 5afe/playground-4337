FROM docker.io/library/node:18

WORKDIR /src/playground

COPY package.json package-lock.json .
RUN npm ci

COPY contracts/ scripts/ src/ hardhat.config.js .
ENTRYPOINT ["npm", "run"]
CMD ["setup"]
