import { Component, Host, Prop, State, h } from '@stencil/core';

import { makeHtml } from '../../utils/parser';

/**
 * @internal
 */
@Component({
  tag: 'aloud-entry',
  styleUrl: 'entry.scss',
  scoped: true,
})
export class AloudEntry {
  @Prop() author: string;
  @Prop({
    mutable: true,
  })
  markdown: string;

  @State() isEdit = false;

  editor: HTMLAloudEditorElement;

  render() {
    return (
      <Host class="media">
        <figure class="media-left">
          <p class="image is-48x48">
            <img src="https://bulma.io/images/placeholders/96x96.png" />
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <h5>{this.author}</h5>
            {this.isEdit ? (
              <aloud-editor
                class="textarea"
                ref={el => {
                  this.editor = el;
                }}
                value={this.markdown}
              />
            ) : (
              <div innerHTML={makeHtml(this.markdown)} />
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
                    if (this.editor) {
                      this.editor.getValue().then(v => {
                        this.markdown = v;
                      });
                    }

                    this.isEdit = !this.isEdit;
                  }}
                >
                  {this.isEdit ? 'Save' : 'Edit'}
                </a>
              </span>
              <span>2 hrs</span>
            </small>
          </div>

          <slot />
        </div>
      </Host>
    );
  }
}
