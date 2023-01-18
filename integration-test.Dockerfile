FROM node:18
WORKDIR /app
COPY integration-test/ .

RUN yarn install

CMD ["yarn", "test:it"]
