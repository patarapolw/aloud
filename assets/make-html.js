import showdown from 'showdown'
import createDOMPurify from 'dompurify'
import shortid from 'shortid'
import scopeCss from 'scope-css'

export class MakeHtml {
  constructor (
    id = `el__${shortid.generate()}`
  ) {
    this.id = id
    this.mdConverter = new showdown.Converter({
      parseImgDimensions: true,
      simplifiedAutoLink: true,
      strikethrough: true,
      tables: true,
      disableForced4SpacesIndentedSublists: true,
      backslashEscapesHTMLTags: true,
      emoji: true,
      simpleLineBreaks: true
    })
  }

  /**
   *
   * @param {string} s
   */
  parse (s) {
    if (typeof window !== 'undefined') {
      let root = document.createElement('body')
      root.innerHTML = s

      Array.from(root.getElementsByTagName('markdown')).map((el) => {
        const div = document.createElement('div')
        Array.from(el.attributes).map(attr => div.setAttribute(attr.name, attr.value))
        div.setAttribute('data-markdown', '')

        const indentStr = el.getAttribute('indent')
        const indent = indentStr === null ? null : parseInt(indentStr)

        const lines = el.innerHTML.split('\n')
        const baseIndent = lines.length > 0 ? lines[lines.length - 1].length : 0
        const maxIndent = Math.max(0, ...lines
          .slice(1, lines.length > 1 ? lines.length - 1 : undefined)
          .map(li => /^ *[^ ]/.exec(li))
          .filter(m => m)
          .map(m => m[0].length - 1))

        if (isNaN(indent) || indent === null) {
          const regex = new RegExp(`^ {0,${maxIndent}}`)
          div.innerHTML = lines.map(li => li.replace(regex, '')).join('\n')
        } else {
          const trueIndent = indent + baseIndent

          const regex = new RegExp(`^ {0,${trueIndent > maxIndent ? maxIndent : trueIndent}}`)
          div.innerHTML = lines.map(li => li.replace(regex, '')).join('\n')
        }

        el.replaceWith(div)
      })

      root.innerHTML = this.mdConverter.makeHtml(root.innerHTML)

      root = createDOMPurify(window).sanitize(root.innerHTML, {
        RETURN_DOM: true
      })

      Array.from(root.getElementsByTagName('style')).map((el) => {
        el.innerHTML = scopeCss(el.innerHTML, `#${this.id}`)
      })

      return root.innerHTML
    }
    return ''
  }
}
