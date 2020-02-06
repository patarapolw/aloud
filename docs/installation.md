# Installation

This is powered by Express.js (on Node.js), and is tested on Yarn.

## Requirements

- MongoDB, probably with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Auth0](https://auth0.com/)
- [Cloudinary](https://cloudinary.com), if you want your users to be able to upload images, or paste from clipboard.
- Hosting platform, such as Heroku.

## Instructions

- Clone this project
- Create `./aloud.config.js` with the settings look like this

```js
export default {
  baseUrl: 'https://aloud-comments.herokuapp.com',
  allowedUrls: [
    '^https?://aloud-comments\\.herokuapp\\.com',
    '^https?://patarapolw\\.github\\.io'
  ],
  session: {
    secret: '<GENERATE IT YOURSELF>'
  },
  auth0: {
    clientId: '<GET THIS FROM AUTH0>',
    domain: '<GET THIS FROM AUTH0>',
    secret: '<GET THIS FROM AUTH0>'
  },
  mongo: {
    uri: '<GET THIS FROM MONGODB>'
  },
  cloudinary: {
    cloudName: '<GET THIS FROM CLOUDINARY>',
    apiKey: '<GET THIS FROM CLOUDINARY>',
    apiSecret: '<GET THIS FROM CLOUDINARY>',
    folder: 'aloud'
  }
}
```

- A personal secret, like SESSION_SECRET can be generated via command line, with `openssl rand -base64 32`, or [some other ways](https://www.howtogeek.com/howto/30184/10-ways-to-generate-a-random-password-from-the-command-line/).

## Installing on your frontend

Simply create an `<iframe>` with a URL looking like this.

```js
`${baseUrl}/comments?id=${id}`
```

You'll also have to make sure that your id is in the list of `allowedUrls`.

## Deploying to Heroku

- Push secrets to Heroku with `node ./push-secrets.js`
- Now, you can `git push heroku master` as usual.
