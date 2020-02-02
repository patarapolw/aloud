# Aloud

> Aloud your commenting system on your personal web server.

## Requirements

- MongoDB, probably with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Auth0](https://auth0.com/)
- [Cloudinary](https://cloudinary.com), if you want your users to be able to upload images, or paste from clipboard.
- Hosting platform, such as Heroku.

## Setting up

- Clone this project
- Create `.env` with the following settings

```dotenv
BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_DOMAIN=
AUTH0_CLIENT_SECRET=
SESSION_SECRET=
```

- A personal secret, like SESSION_SECRET can be generated via command line, with `openssl rand -base64 32`, or [some other ways](https://www.howtogeek.com/howto/30184/10-ways-to-generate-a-random-password-from-the-command-line/).

## Demo

See <https://aloud-comments.herokuapp.com>
