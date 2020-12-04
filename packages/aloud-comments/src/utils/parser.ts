import DOMPurify from 'dompurify';
import scopeCss from 'scope-css';
import showdown from 'showdown';

export const mdConverter = new showdown.Converter({
  noHeaderId: true,
  parseImgDimensions: true,
  simplifiedAutoLink: true,
  literalMidWordUnderscores: true,
  strikethrough: true,
  tables: true,
  tasklists: true,
  simpleLineBreaks: true,
  openLinksInNewWindow: true,
  backslashEscapesHTMLTags: true,
  emoji: true,
  underline: true,
});

export function makeHtml(md: string): string {
  const div = document.createElement('div');
  div.id = 'md-' + Math.random().toString(36).substr(2);
  div.innerHTML = mdConverter.makeHtml(md);
  div.querySelectorAll('style').forEach(el => {
    el.innerHTML = scopeCss(el.innerHTML, `#${div.id}`);
  });

  const html = div.outerHTML;
  div.remove();

  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['style'],
  });
}
