FROM node:19-alpine

WORKDIR /app

EXPOSE 3000

COPY package.json yarn-lock.json ./

RUN yarn

COPY . ./

CMD yarn start