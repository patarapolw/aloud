FROM node:12-alpine AS web
RUN mkdir -p /app
WORKDIR /app
COPY packages/web/package.json packages/web/package-lock.json /web/
RUN npm i
COPY packages/web /app
ARG FIREBASE_CONFIG
RUN npm run build

FROM node:12-alpine
RUN mkdir -p /app
WORKDIR /app
COPY packages/server/package.json packages/server/package-lock.json /server/
RUN npm i
COPY packages/server /app
RUN npm run build
RUN npm prune --production; exit 0
COPY --from=web /app/dist /app/public
EXPOSE 8080
CMD [ "npm", "start" ]