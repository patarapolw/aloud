# Installation

This is powered by Express.js (on Node.js), and is tested on Yarn.

## Requirements

- MongoDB, probably with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Auth0](https://auth0.com/)
- [Cloudinary](https://cloudinary.com), if you want your users to be able to upload images, or paste from clipboard.
- Hosting platform, such as Heroku.

## Instructions

- Clone this project
- Create `/aloud.config.js` with the settings look like this

```js
export default {
  baseUrl: 'https://aloud-comments.herokuapp.com',
  allowedUrls: [
    /:\/\/aloud-comments.herokuapp.com/
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

Easily managing branches and `.gitignore`'d files, can easily be done with `git worktree`.

```sh
rm -rf dist  # Ensure that dist folder isn't exist in the first place
git worktree add dist heroku
sed '/aloud.config.js/d' aloud.config.js > dist/aloud.config.js
cd dist
git add .
git commit -m 'Deploy to Heroku'
git push heroku heroku:master
cd ..
git worktree remove dist
```
