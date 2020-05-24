FROM node:12-alpine

RUN apk add --no-cache git
RUN mkdir -p /app
WORKDIR /app
COPY package.json .
RUN npm i --only=production
RUN apk del git

COPY . .
RUN echo 'export const allowedUrls = [/\/\/(.+?)?\.polv\.cc\//]' > aloud.config.js
RUN mv .env.prod .env
EXPOSE 8080
CMD ["npx", "nuxt", "start", "--hostname", "0.0.0.0", "--port", "8080" ]