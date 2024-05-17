FROM node:19-alpine

WORKDIR /app

EXPOSE 3000

COPY package.json package-lock.json ./

RUN yarn

COPY . ./

CMD yarn start