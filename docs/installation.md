# Installation

This is powered by Express.js (on Node.js), and is tested on Yarn.

## Requirements

- MongoDB, probably with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Auth0](https://auth0.com/)
- [Cloudinary](https://cloudinary.com), if you want your users to be able to upload images, or paste from clipboard.
- Hosting platform, such as Heroku.

## Instructions

- Clone this project
- Create `./aloud.config.json` with the settings look like this

```json
{
  "baseUrl": "https://aloud-comments.herokuapp.com",
  "allowedUrls": [
    "^https?://patarapolw\\.github\\.io"
  ],
  "session": {
    "secret": "<GENERATE_IT_YOURSELF>"
  },
  "auth0": {
    "clientId": "<GET_THIS_FROM_AUTH0>",
    "domain": "<GET_THIS_FROM_AUTH0>",
    "secret": "<GET_THIS_FROM_AUTH0>",
  },
  "mongo": {
    "uri": "<GET_THIS_FROM_MONGODB_ATLAS_OR_HOST_IT_YOURSELF>",
  },
  "cloudinary": {
    "cloudName": "<GET_THIS_FROM_CLOUDINARY>",
    "apiKey": "<GET_THIS_FROM_CLOUDINARY>",
    "apiSecret": "<GET_THIS_FROM_CLOUDINARY>",
    "folder": "aloud"
  }
}
```

- A personal secret, like SESSION_SECRET can be generated via command line, with `openssl rand -base64 32`, or [some other ways](https://www.howtogeek.com/howto/30184/10-ways-to-generate-a-random-password-from-the-command-line/).

## Installing on your frontend

Simply create an `<iframe frameborder="0" sandbox="allow-scripts allow-popups allow-same-origin">` with a URL looking like this.

```js
`${baseUrl}/comments?path=${path}`
```

You'll also have to make sure that your `path` is in the list of `allowedUrls`.

## Deploying to Heroku

- Push secrets to Heroku with `node heroku/push-secrets.js`
- Now, you can `git push heroku master` as usual.
