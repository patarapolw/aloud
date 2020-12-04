import { Component, Host, Prop, State, h } from '@stencil/core';

import { makeHtml } from '../../utils/parser';
import { IApi, IEntry, IFirebaseConfig } from '../aloud-comments/aloud-comments';

/**
 * @internal
 */
@Component({
  tag: 'aloud-subentry',
  styleUrl: 'subentry.scss',
  scoped: true,
})
export class AloudEntry {
  @Prop() parent!: string;
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
      <Host>
        {this.isEdit ? (
          <aloud-editor
            firebase={this.firebase}
            ref={el => {
              this.editor = el;
            }}
            value={this.entry.markdown}
          />
        ) : (
          <small
            ref={() => {
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
            }}
            innerHTML={makeHtml(`[**@${this.parent}**](#) ` + this.entry.markdown)}
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
          <span class="small-author">by {this.entry.author}</span>
        </small>
      </Host>
    );
  }
}
