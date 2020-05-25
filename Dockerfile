FROM node:12-alpine
RUN mkdir -p /app
WORKDIR /app
RUN apk add yarn
COPY packages/server/package.json packages/server/yarn.lock /app/
RUN yarn
COPY packages/server /app
RUN yarn build
COPY packages/web/dist /app/public
EXPOSE 8080
CMD [ "yarn", "start" ]