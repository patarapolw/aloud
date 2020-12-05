import { Component, Host, Prop, State, h } from '@stencil/core';
import { AxiosInstance } from 'axios';

import { IAuthor } from '../../utils/faker';
import { humanizeDurationToNow } from '../../utils/humanize';
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
  @Prop() user!: IAuthor;
  @Prop({
    mutable: true,
  })
  entry!: IEntry;
  @Prop() api!: IApi;
  @Prop() axios!: AxiosInstance;
  @Prop() firebase!: IFirebaseConfig;
  @Prop() depth!: number;

  @State() isEdit = false;
  @State() isReply = false;

  editor: HTMLAloudEditorElement;
  replier: HTMLAloudEditorElement;

  render() {
    return (
      <Host class="media">
        <figure class="media-left">
          <p class="image is-48x48">
            <img src={this.entry.author.image} title={this.entry.author.name} />
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
              {this.entry.author.id === this.user.id
                ? [
                    ,
                    <span>
                      <a
                        role="button"
                        onClick={() => {
                          if (this.editor) {
                            this.editor.getValue().then(async v => {
                              if (this.api) {
                                return this.axios
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
                    </span>,
                  ]
                : [
                    <span>
                      <a role="button" title="Like">
                        ❤️
                      </a>
                    </span>,
                    <span>
                      <a role="button" title="Dislike">
                        👎
                      </a>
                    </span>,
                    <span>
                      <a role="button" title="Bookmark">
                        🔖
                      </a>
                    </span>,
                  ]}

              <span>
                <a
                  role="button"
                  onClick={() => {
                    if (this.replier) {
                      this.replier.getValue().then(async v => {
                        if (!v.trim()) {
                          return;
                        }

                        if (this.api) {
                          return this.axios
                            .post(this.api.post, {
                              author: this.entry.author.id,
                              markdown: v,
                              parent: this.entry.id,
                            })
                            .then(({ data: { id } }) => {
                              this.entry = {
                                ...this.entry,
                                children: [
                                  {
                                    id,
                                    author: this.entry.author,
                                    markdown: v,
                                    createdAt: +new Date(),
                                  },
                                  ...(this.entry.children || []),
                                ],
                              };
                            });
                        }

                        this.entry = {
                          ...this.entry,
                          children: [
                            {
                              id: Math.random(),
                              author: this.entry.author,
                              markdown: v,
                              createdAt: +new Date(),
                            },
                            ...(this.entry.children || []),
                          ],
                        };
                      });
                    }

                    this.isReply = !this.isReply;
                  }}
                >
                  {this.isReply ? 'Post reply' : 'Reply'}
                </a>
              </span>

              <span>{humanizeDurationToNow(this.entry.createdAt)}</span>
            </small>
          </div>

          {this.isReply ? (
            <aloud-editor
              class="textarea"
              ref={el => {
                this.replier = el;
              }}
              firebase={this.firebase}
            ></aloud-editor>
          ) : null}

          {this.entry.children
            ? this.entry.children.map(it =>
                this.depth > 2 ? (
                  <aloud-subentry user={this.user} parent={this.entry.author} entry={it} api={this.api} axios={this.axios} firebase={this.firebase}></aloud-subentry>
                ) : (
                  <aloud-entry user={this.user} entry={it} api={this.api} axios={this.axios} firebase={this.firebase} depth={this.depth + 1}></aloud-entry>
                ),
              )
            : null}
        </div>
      </Host>
    );
  }
}
