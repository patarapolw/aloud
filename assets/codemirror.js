export const cmOptions = {
  mode: 'markdown',
  extraKeys: {
    Tab: cm => cm.execCommand('indentMore'),
    'Shift-Tab': cm => cm.execCommand('indentLess')
  },
  matchTags: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  autoCloseTags: true,
  lineWrapping: true
}
