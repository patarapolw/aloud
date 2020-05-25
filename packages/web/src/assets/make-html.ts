import SparkMD5 from 'spark-md5'
// import { unescapeAll } from 'markdown-it/lib/common/utils'
import emoji from 'markdown-it-emoji'
import imsize from 'markdown-it-imsize'
import mdContainer from 'markdown-it-container'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import hljsDefineVue from 'highlightjs-vue'
import { liquid } from './template'
import 'highlight.js/styles/default.css'

hljsDefineVue(hljs)

export class MakeHtml {
  md: MarkdownIt
  html = ''
  id: string

  constructor (id?: string) {
    this.id = id
      ? `el__${SparkMD5.hash(id)}`
      : `el__${Math.random()
          .toString(36)
          .substr(2)}`
    this.md = MarkdownIt({
      breaks: true
    })
    // .use((md) => {
    //   const { fence } = md.renderer.rules

    //   md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    //     const token = tokens[idx]
    //     const info = token.info ? unescapeAll(token.info).trim() : ''
    //     const content = token.content

    //     if (info === 'css parsed') {
    //       return this._makeCss(content)
    //     } else if (info === 'yaml link') {
    //       return this._makeLink(yaml.safeLoad(content))
    //     }

      //     return fence!(tokens, idx, options, env, slf)
      //   }
      //   return md
      // })
      .use(emoji)
      .use(imsize)
      .use(mdContainer, 'spoiler', {
        validate: (params: string) => {
          return params.trim().match(/^spoiler(?:\s+(.*))?$/)
        },
        render: (tokens: any[], idx: number) => {
          const m = tokens[idx].info.trim().match(/^spoiler(?:\s+(.*))?$/)

          if (tokens[idx].nesting === 1) {
            // opening tag
            return (
              '<details style="margin-bottom: 1rem;"><summary>' +
              this.md.utils.escapeHtml(m[1] || 'Spoiler') +
              '</summary>\n'
            )
          } else {
            // closing tag
            return '</details>\n'
          }
        }
      })
  }

  /**
   *
   * @param {string} s
   */
  async parse (s: string) {
    if (typeof window !== 'undefined') {
      const html = this.md.render(s)
      const div = document.createElement('div')
      div.innerHTML = await this._prerender(html)
      return this._postrender(div).innerHTML
    }
    return ''
  }

  private _prerender (s: string) {
    return liquid.parseAndRender(s)
  }

  private _postrender (dom: HTMLElement) {
    dom.querySelectorAll('iframe').forEach((el) => {
      const w = el.width
      const h = el.height

      const style = getComputedStyle(el)

      el.style.width = el.style.width || style.width || (w ? `${w}px` : '')
      el.style.height = el.style.height || style.height || (h ? `${h}px` : '')
    })

    dom.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightBlock(el)
    })

    return dom
  }
}
