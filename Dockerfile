FROM node:12-alpine AS web
RUN apk add yarn
RUN apk add git
RUN mkdir -p /app
WORKDIR /app
COPY packages/web/package.json packages/web/yarn.lock /app/
RUN yarn
COPY packages/web /app
RUN yarn build

FROM node:12-alpine
RUN apk add yarn
RUN apk add jq
RUN mkdir -p /app
WORKDIR /app
COPY packages/server/package.json packages/server/yarn.lock /app/
RUN yarn
COPY packages/server /app
RUN yarn build
RUN yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")')
COPY --from=web /app/dist /app/public
EXPOSE 8080
CMD [ "yarn", "start" ]
