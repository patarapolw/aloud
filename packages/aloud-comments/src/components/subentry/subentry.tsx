import { Component, Host, Prop, State, h } from '@stencil/core';

import { makeHtml } from '../../utils/parser';

/**
 * @internal
 */
@Component({
  tag: 'aloud-subentry',
  styleUrl: 'subentry.scss',
  scoped: true,
})
export class AloudEntry {
  @Prop() parent: string;
  @Prop() author: string;
  @Prop() markdown: string;

  @State() isEdit = false;

  editor: HTMLAloudEditorElement;

  render() {
    return (
      <Host>
        {this.isEdit ? (
          <aloud-editor
            ref={el => {
              this.editor = el;
            }}
            value={this.markdown}
          />
        ) : (
          <small
            ref={() => {
              if (this.editor) {
                this.editor.getValue().then(v => {
                  this.markdown = v;
                });
              }
            }}
            innerHTML={makeHtml(`[**@${this.parent}**](#) ` + this.markdown)}
          />
        )}
        <small class="dot-separated">
          <span>
            <a role="button">Like</a>
          </span>
          <span>
            <a role="button">Reply</a>
          </span>
          <span>
            <a
              role="button"
              onClick={() => {
                this.isEdit = !this.isEdit;
              }}
            >
              {this.isEdit ? 'Save' : 'Edit'}
            </a>
          </span>
          <span>2 hrs</span>
          <span class="small-author">by {this.author}</span>
        </small>
      </Host>
    );
  }
}
