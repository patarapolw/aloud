# Installation

## Deploying the backend

You will need both

- Firebase,
  - Auth and Storage enabled
  - CORS enabled for Storage, by running `npm run cors`
- MongoDB,
  - Stitch enabled
  - Allow login with Email and Anonymous

Also, three hidden files you will need for the repo are,

- `.env`
- `firebase.config.js`
- `aloud.config.js`

Put this in `.env`.

```sh
BASE_URL='http://localhost:3000'
# BASE_URL='https://<YOUR_ONLINE_BASE_URL>'
MONGO_APP_ID='<GET_THIS_FROM_MONGO_DB_STITCH>'
STORAGE_BUCKET='<GET_THIS_FROM_FIREBASE.CONFIG.JS>'
SECRET='<GENERATE_RANDOMLY>' # I use https://randomkeygen.com/
```

Put this in `aloud.config.js`

```js
export const allowedUrls = [/\/\/localhost/, new RegExp(`//(.+?)?${escapeRegExp(YOUR_COMMENT_ENABLED_WEBSITE)}`)]
```

`firebase.config.js` is Firebase config object. See <https://firebase.google.com/docs/web/setup#using-module-bundlers>.

For performance reasons, you will also need indexing in MongoDB database, on the following keys,

- `path`
- `createdAt`
- `url`

For deployment, I use Google App Engine, see <https://nuxtjs.org/faq/appengine-deployment>.

## Adding comments to the frontend

It is as simple as adding an IFrame,

```html
<iframe
  src="<YOUR_ALOUD_HOSTING>/comment?url=${encodeURIComponent(target)}"
  frameborder="0"
  sandbox="allow-scripts allow-popups allow-same-origin"
></iframe>
```
