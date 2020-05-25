import { Liquid } from 'liquidjs'
import axios from 'axios'
import he from 'he'

import { split } from './shlex'

export const liquid = new Liquid()

liquid.registerTag('link', {
  parse (token) {
    this.href = token
  },
  async render () {
    const meta = (
      await axios.get('/api/metadata', {
        params: {
          q: this.href
        }
      })
    ).data

    const img = `
    <img style="${'max-width: 200px; margin-right: 1em; width: 100%; height: auto;'}" ${
      meta
        ? meta.image
          ? `src="${encodeURI(meta.image)}" ` +
            `alt="${he.encode(meta.title || meta.url)}" `
          : ''
        : ''
    } />`

    const innerHTML = `${
      meta.image
        ? `
      <div style="${'max-width: 200px; margin-right: 1em;' +
        'display: flex; align-items: center; justify-content: center;' +
        'overflow: hidden;'}">${img}
      </div>`
        : ''
    }
      <div>
        ${
          meta.title
            ? `<h3 style="color: darkblue; margin-block-start: 0;">${he.encode(
                meta.title
              )}</h3>`
            : `<h6 style="color: darkblue; margin-block-start: 0;">${he.encode(
                meta.url
              )}</h6>`
        }
        ${he.encode(meta.description || '')}
      </div>`

    return `
    <a is="a-card" style="${`flex-direction: ${'row'};` +
      'display: flex;' +
      'margin: 1em; padding: 1em;' +
      'box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);'}" href="${encodeURI(
      meta.url
    )}"
    rel="noopener" target="_blank">
      ${innerHTML}
    </a>`
  }
})

liquid.registerTag('youtube', {
  parse (token) {
    this.href = split(token.args)[0]
  },
  render () {
    return this.href
      ? `
    <iframe
      width="560" height="315"
      style="height: 315px;"
      src="https://www.youtube.com/embed/${encodeURIComponent(this.href)}"
      frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
    ></iframe>`
      : ''
  }
})

liquid.registerTag('speak', {
  parse (token) {
    const [href, str] = split(token.args)
    this.word = href
    this.lang = str || 'zh'
  },
  render () {
    const href = `https://speak-btn.now.sh/btn?q=${encodeURIComponent(
      this.word
    )}&lang=${encodeURIComponent(this.lang)}`

    return this.word
      ? `
      <iframe
        src="${href}"
        style="width: 20px; height: 20px; display: inline-block;"
        frameborder="0" allowtransparency="true"
      ></iframe>`
      : ''
  }
})
