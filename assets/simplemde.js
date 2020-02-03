import { MakeHtml } from './make-html'

/**
 * @param {string} [id]
 * @returns {typeof import("simplemde").Options}
 */
export function getMdeOptions (id) {
  const SimpleMDE = require('simplemde')
  const makeHtml = new MakeHtml(id)

  return {
    autoSave: {
      enabled: !!id,
      uniqueId: id
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
      '|',
      {
        name: 'guide',
        action: '/guide',
        className: 'fa fa-question-circle',
        title: 'Markdown Guide'
      }
    ],
    indentWithTabs: false,
    placeholder: 'Please enter markdown to continue.',
    previewRender: (plainText) => {
      return makeHtml.parse(plainText)
    },
    spellChecker: false,
    renderingConfig: {
      codeSyntaxHighlighting: true
    },
    status: false
  }
}
