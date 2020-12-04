import { Component, Prop, h, Method, State, Host } from '@stencil/core';
import CodeMirror from 'codemirror';
import showdown from 'showdown';
import scopeCss from 'scope-css';

import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/mode/overlay';
import 'codemirror/addon/comment/comment';

(window as any).CodeMirror = CodeMirror;

CodeMirror.defineMode('markdown-ejs', (config, parserConfig) => {
  return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || 'markdown'), {
    token: stream => {
      let ch: string;
      if (stream.match('<%')) {
        while ((ch = stream.next()) != null)
          if (ch === '%' && stream.next() === '>') {
            stream.eat('>');
            return 'application/x-ejs';
          }
      }

      while (stream.next() !== null && !stream.match('<%', false)) {}

      return null;
    },
  });
});

/**
 * @internal
 */
@Component({
  tag: 'aloud-editor',
  styleUrl: 'editor.scss',
  scoped: true
})
export class Editor {
  @Prop({
    mutable: true,
    reflect: true,
  })
  value: string = '';

  cm!: CodeMirror.Editor;
  cmEl!: HTMLTextAreaElement;

  @State() html = '';
  @State() _isEdit = true;

  setEdit(b: boolean) {
    this._isEdit = b

    if (!b) {
      this.parse()
    } else if (this.cm) {
      this.cm.setValue(this.value)
    }
  }

  readonly mdConverter = new showdown.Converter({
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

  async initCm() {
    if (this.cm) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 10))

    const shiftTabs = (d: number) => {
      const spaces = Array(this.cm.getOption('indentUnit') + d).join(' ');
      const doc = this.cm.getDoc();
      const { line: startLine } = this.cm.getCursor();
      const endPoint = this.cm.getCursor('to');

      const lines = doc
        .getRange({ ch: 0, line: startLine }, endPoint)
        .split(/\n/g)
        .map(r => spaces + r);
      doc.replaceRange(lines.join('\n'), { ch: 0, line: startLine }, endPoint);
    };

    this.cm = CodeMirror.fromTextArea(this.cmEl, {
      mode: 'markdown',
      autoCloseBrackets: true,
      lineWrapping: true,
      tabSize: 4,
      extraKeys: {
        'Tab': () => shiftTabs(1),
        'Shift-Tab': () => shiftTabs(-1),
      }
    });

    this.cm.setValue(this.value);
  }

  @Method()
  async parse() {
    this.value = this.cm.getValue();

    const div = document.createElement('div');
    div.id = 'md-' + Math.random().toString(36).substr(2);
    div.innerHTML = this.mdConverter.makeHtml(this.value);
    div.querySelectorAll('style').forEach(el => {
      el.innerHTML = scopeCss(el.innerHTML, `#${div.id}`);
    });

    this.html = div.outerHTML;
    div.remove();

    return this.html
  }

  render() {
    return (
      <Host>
        <nav class="tabs is-right">
          <ul>
            <li class={this._isEdit ? 'is-active' : ''}>
              <a
                role="button"
                onClick={() => {
                  this.setEdit(true);
                }}
              >
                Editor
              </a>
            </li>
            <li class={!this._isEdit ? 'is-active' : ''}>
              <a
                role="button"
                onClick={() => {
                  this.setEdit(false);
                }}
              >
                Preview
              </a>
            </li>
          </ul>
        </nav>

        <article class={this._isEdit ? 'hide-scrollbar' : ''}>
          <div style={{ display: this._isEdit ? 'block' : 'none' }}>
            <textarea
              ref={el => {
                this.cmEl = el;
                this.initCm();
              }}
            ></textarea>
          </div>

          <div class="content" innerHTML={this.html} style={{ display: !this._isEdit ? 'block' : 'none' }}></div>
        </article>
      </Host>
    );
  }
}
