import { Component, Host, Prop, State, h } from '@stencil/core';
import prettyMs from 'pretty-ms';

import { makeHtml } from '../../utils/parser';
import { IApi, IEntry, IFirebaseConfig } from '../aloud-comments/aloud-comments';

/**
 * @internal
 */
@Component({
  tag: 'aloud-entry',
  styleUrl: 'entry.scss',
  scoped: true,
})
export class AloudEntry {
  @Prop({
    mutable: true,
  })
  entry!: IEntry;
  @Prop() api!: IApi;
  @Prop() firebase!: IFirebaseConfig;

  @State() isEdit = false;

  editor: HTMLAloudEditorElement;

  render() {
    return (
      <Host class="media">
        <figure class="media-left">
          <p class="image is-48x48">
            <img src={this.entry.author.image} alt={this.entry.author.name} />
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <h5>{this.entry.author.name}</h5>
            {this.isEdit ? (
              <aloud-editor
                class="textarea"
                firebase={this.firebase}
                ref={el => {
                  this.editor = el;
                }}
                value={this.entry.markdown}
              />
            ) : (
              <div innerHTML={makeHtml(this.entry.markdown)} />
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
                      this.editor.getValue().then(async v => {
                        if (this.api) {
                          return this.api.axios
                            .patch(
                              this.api.update,
                              {
                                markdown: v,
                              },
                              {
                                params: {
                                  id: this.entry.id,
                                },
                              },
                            )
                            .then(() => {
                              this.entry = {
                                ...this.entry,
                                markdown: v,
                              };
                            });
                        }

                        this.entry = {
                          ...this.entry,
                          markdown: v,
                        };
                      });
                    }

                    this.isEdit = !this.isEdit;
                  }}
                >
                  {this.isEdit ? 'Save' : 'Edit'}
                </a>
              </span>
              <span>{prettyMs(+new Date() - this.entry.createdAt, { unitCount: 2, secondsDecimalDigits: 0 })}</span>
            </small>
          </div>

          <slot />
        </div>
      </Host>
    );
  }
}
