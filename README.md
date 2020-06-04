# Aloud

> Aloud your commenting system on your personal web server.

This project is powered by [MongoDB](https://www.mongodb.com) and [Firebase](https://firebase.google.com).

## Features

This project uses [Markdown-it](https://markdown-it.github.io/) to parse Markdown for additional security.

Other than standard features, some of the features (from plugins) are

- parseImgDimensions `![bar](bar.jpg =100x*)`
- emoji :smile: :100:
- simpleLineBreaks

For more, see [Markdown Guide](/docs/guide.md).

I also extended with LiquidJS, see [github:patarapolw/aloud:packages/web/src/assets/template.ts](https://github.com/patarapolw/aloud/blob/master/packages/web/src/assets/template.ts).

## Troubleshooting

Profile images are powered by [Gravatar](https://gravatar.com/). Try upload an avatar there, if your image isn't shown.

## Installation

See [Installation Guide](/docs/installation.md).

## Demo

See <https://aloud.polv.cc>
