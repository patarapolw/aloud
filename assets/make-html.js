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
      root.innerHTML = this.mdConverter.makeHtml(s)

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
