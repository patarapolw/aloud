import { Component, Host, Prop, State, h } from '@stencil/core';
import axios from 'axios';
import * as firebaseui from 'firebaseui';
import S, { BaseSchema } from 'jsonschema-definer';

import { IAuthor, IPost, randomAuthor, randomPost } from '../../utils/faker';

const sEntry = (S.shape({
  id: S.anyOf(S.string(), S.number()),
  author: S.shape({
    id: S.anyOf(S.string(), S.number()),
    name: S.string(),
    image: S.string(),
  }),
  markdown: S.string(),
  createdAt: S.number(),
  updatedAt: S.number().optional(),
  children: S.list(S.custom(v => !!sEntry.validate(v)[0])).optional(),
}) as unknown) as BaseSchema<IEntry>;

export interface IEntry extends IPost {
  children?: IEntry[];
}

const sApi = S.shape({
  init: S.string(),
  post: S.string(),
  update: S.string(),
  delete: S.string(),
});

export type IApi = typeof sApi.type;

export type IFirebaseConfig = {
  [k: string]: unknown;
};

@Component({
  tag: 'aloud-comments',
  styleUrl: 'aloud-comments.scss',
  shadow: true,
})
export class AloudComments {
  /**
   * Firebase configuration. Will be `yaml.safeLoad()`
   *
   * Requires either string version in HTML or Object version in JSX
   */
  @Prop({
    attribute: 'firebase',
  })
  _firebase: string;

  /**
   * Firebase configuration
   */
  @Prop({
    mutable: true,
  })
  firebase!: IFirebaseConfig;

  @Prop({
    mutable: true,
    reflect: true,
  })
  firebaseui!: firebaseui.auth.AuthUI;

  /**
   * API configuration. Will be `yaml.safeLoad()`
   *
   * Requires either string version in HTML or Object version in JSX
   */
  @Prop({
    attribute: 'api',
  })
  _api: string;

  /**
   * API configuration
   */
  @Prop({
    mutable: true,
  })
  api!: IApi;

  /**
   * Axios object. Can be ones configured with CSRF or auth.
   */
  @Prop({
    mutable: true,
    reflect: true,
  })
  axios = axios.create();

  @Prop() debug = false;

  @State() author: IAuthor;
  @State() entries: IEntry[] = [];

  mainEditor: HTMLAloudEditorElement;

  componentWillLoad() {
    if (!this.debug) {
      this.firebase = this.firebase || S.object().ensure(JSON.parse(this._firebase));
      this.api = this.api || sApi.ensure(JSON.parse(this._api));
    }

    if (this.api) {
      this.axios.get(this.api.init).then(({ data }) => {
        this.entries = data;
      });
    } else {
      const authors = {
        collection: [] as IAuthor[],
        new() {
          const a = randomAuthor();
          this.collection.push(a);
          return a;
        },
      };

      const posts = {
        collection: new Map<string, IPost>(),
        new(id: string, parent?: string) {
          const a = randomPost(parent ? new Date(this.collection.get(parent).createdAt) : undefined);
          this.collection.set(id, {
            ...a,
            id,
          });
          return a;
        },
      };

      this.author = authors.new();

      this.entries = [
        {
          ...posts.new('0'),
          author: authors.new(),
        },
        {
          ...posts.new('1'),
          author: authors.new(),
          children: [
            {
              ...posts.new('11', '1'),
              author: authors.collection[0],
              children: [
                {
                  ...posts.new('111', '11'),
                  author: authors.new(),
                  children: [
                    {
                      ...posts.new('1111', '111'),
                      author: this.author,
                    },
                  ],
                },
              ],
            },
            {
              ...posts.new('12', '1'),
              author: authors.new(),
            },
          ].sort((i1, i2) => i2.createdAt - i1.createdAt),
        },
        {
          ...posts.new('2'),
          author: authors.collection[4],
        },
      ];
    }
  }

  render() {
    return (
      <Host>
        <article class="media mb-4">
          <figure class="media-left">
            <p class="image is-64x64">
              <img src={this.author.image} alt={this.author.name} title={this.author.name} />
            </p>
          </figure>
          <div class="media-content">
            <div class="field">
              <p class="control">
                <div class="textarea">
                  <aloud-editor
                    firebase={this.firebase}
                    ref={el => {
                      this.mainEditor = el;
                    }}
                  />
                </div>
              </p>
            </div>
            <nav class="level">
              <div class="level-left">
                <div class="level-item">
                  <button
                    class="button is-info"
                    type="button"
                    onClick={() => {
                      this.mainEditor.getValue().then(async v => {
                        if (this.api) {
                          return this.axios
                            .post(this.api.post, {
                              author: this.author.id,
                              markdown: v,
                            })
                            .then(({ data: { id } }) => {
                              this.entries = [
                                {
                                  id,
                                  author: this.author,
                                  markdown: v,
                                  createdAt: +new Date(),
                                },
                                ...this.entries,
                              ];
                            });
                        }

                        this.entries = [
                          {
                            id: Math.random(),
                            author: this.author,
                            markdown: v,
                            createdAt: +new Date(),
                          },
                          ...this.entries,
                        ];
                      });

                      this.mainEditor.value = '';
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </article>

        {this.entries.map(it => (
          <aloud-entry user={this.author} entry={it} api={this.api} axios={this.axios} firebase={this.firebase} depth={1}></aloud-entry>
        ))}
      </Host>
    );
  }
}
