import { MakeHtml } from './make-html'

/**
 * @param {string} [id]
 * @returns {typeof import("simplemde").Options}
 */
export function getMdeOptions (id) {
  const SimpleMDE = require('simplemde')
  const makeHtml = new MakeHtml(id)

  return {
    autosave: {
      enabled: !!id,
      uniqueId: id,
      delay: 10000
    },
    toolbar: [
      {
        name: 'undo',
        action: SimpleMDE.undo,
        className: 'fa fa-undo no-disable',
        title: 'Undo'
      },
      {
        name: 'redo',
        action: SimpleMDE.redo,
        className: 'fa fa-repeat no-disable',
        title: 'Redo'
      },
      '|',
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      '|',
      'preview',
      {
        action: () => {},
        className: 'fa fa-save'
      },
      '|',
      {
        name: 'guide',
        action: '/guide',
        className: 'fa fa-question-circle',
        title: 'Markdown Guide'
      }
    ],
    indentWithTabs: false,
    placeholder: 'Please type in markdown to comment.',
    previewRender: (plainText) => {
      return `<div class="content">${makeHtml.parse(plainText)}</div>`
    },
    spellChecker: false,
    renderingConfig: {
      codeSyntaxHighlighting: true
    },
    status: false
  }
}
