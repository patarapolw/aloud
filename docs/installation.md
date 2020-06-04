# Installation

## Deploying the backend

You will need both

- Firebase,
  - Auth and Storage enabled
  - CORS enabled for Storage, by running `gsutil cors set cors.json gs://[BUCKET_NAME]`
- MongoDB

And several environment variables

```sh
BASE_URL='https://<YOUR_ONLINE_BASE_URL>'
SECRET='<GENERATE_RANDOMLY>' # I use https://randomkeygen.com/
PROJECT_ID=
MONGO_URI= # You might use MongoDB Atlas
ALOUD_SITE= # Comma-separated allowed blog origins.
# // (double forward slash) for schema and / (single forward slash) for pathname.
FIREBASE_SDK= # For firebase-admin.
FIREBASE_CONFIG= # For firebase client, although you will also need this in server-side.
# You might convert JSON and module.exports to envvar string by running
# `node -e 'console.log(JSON.stringify(require("./<PATH_TO_JS_OR_JSON_FILE>")))'`
```

For deployment, I myself use Docker on Google Cloud Run.

```sh
docker run \
  -p 8080:8080 \
  -e SECRET -e FIREBASE_SDK -e FIREBASE_CONFIG -e MONGO_URI -e ALOUD_SITE \
  patarapolw/aloud

# Or, build it yourself
robo docker-build   # Build the docker
robo docker-deploy  # Deploy the docker
```

## Running in development

I use [`robo.yml`](https://github.com/tj/robo) and [concurrently](https://github.com/kimmobrunfeldt/concurrently).

```sh
cd packages/server && yarn && cd -
cd packages/web && yarn && cd -
robo dev
```

Of course, you can also use `robo docker-build && robo docker-start`, to simulate production like environment.

## Adding comments to the frontend

It is as simple as adding an IFrame,

```html
<iframe
  src="<YOUR_ALOUD_HOSTING>/comment?url=${encodeURIComponent(target)}"
  frameborder="0"
  sandbox="allow-scripts allow-popups allow-same-origin"
></iframe>
```

However, it won't account for proper IFrame height. A way to solve this is to add,

```js
setScrollHeight (evt: any) {
  if (evt.origin === location.origin) {
    commentElement.style.height = `${evt.data.scrollHeight}px`
  }
}

if (window.addEventListener) {
  window.addEventListener('message', (evt) => {
    setScrollHeight(evt)
  }, false)
} else {
  window.attachEvent('onmessage', (evt) => {
    setScrollHeight(evt)
  })
}
```
