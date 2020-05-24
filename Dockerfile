FROM node:12-alpine

RUN apk add --no-cache git
RUN mkdir -p /app
WORKDIR /app
COPY package.json .
RUN npm i
RUN apk del git

COPY . .
RUN echo 'export const allowedUrls = [/\/\/(.+?)?\.polv\.cc\//]' > aloud.config.js
RUN mv .env.prod .env
RUN npm run build
RUN npm prune
EXPOSE 8080
CMD ["npx", "nuxt", "start", "--hostname", "0.0.0.0", "--port", "8080" ]