import { Component, Host, Prop, State, h } from '@stencil/core';
import axios, { AxiosInstance } from 'axios';
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
  axios: S.any().optional() as BaseSchema<AxiosInstance, false>,
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

  @Prop() debug = false;

  @State() author: IAuthor;
  @State() entries: IEntry[] = [];
  @State() isImageTooltip = false;

  mainEditor: HTMLAloudEditorElement;

  private generateReplies(ents: IEntry[], parent: IAuthor | null = null, depth = 0) {
    return (
      <section>
        {ents.map(it =>
          depth > 2 ? (
            <aloud-subentry parent={parent} entry={it} api={this.api} firebase={this.firebase}>
              {it.children ? this.generateReplies(it.children, it.author, depth + 1) : null}
            </aloud-subentry>
          ) : (
            <aloud-entry entry={it} api={this.api} firebase={this.firebase}>
              {it.children ? this.generateReplies(it.children, it.author, depth + 1) : null}
            </aloud-entry>
          ),
        )}
      </section>
    );
  }

  componentWillLoad() {
    if (!this.debug) {
      this.firebase = this.firebase || S.object().ensure(JSON.parse(this._firebase));

      this.api = this.api || sApi.ensure(JSON.parse(this._api));
      this.api.axios = this.api.axios || axios.create();
    }

    if (this.api) {
      this.api.axios.get(this.api.init).then(({ data }) => {
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
                      author: authors.collection[1],
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
      ];
    }
  }

  render() {
    return (
      <Host>
        <article class="media mb-4">
          <figure class="media-left">
            <p class="image is-64x64" onMouseOver={() => (this.isImageTooltip = true)} onMouseLeave={() => (this.isImageTooltip = false)}>
              <span class="tooltip" style={{ visibility: this.isImageTooltip ? 'visible' : 'hidden' }}>
                {this.author.name}
              </span>
              <img src={this.author.image} alt={this.author.name} />
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
                          return this.api.axios
                            .post(this.api.post, {
                              author: this.author.id,
                              markdown: v,
                            })
                            .then(({ data: { id, createdAt } }) => {
                              this.entries = [
                                {
                                  id,
                                  author: this.author,
                                  markdown: v,
                                  createdAt: +new Date(createdAt),
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

        {this.generateReplies(this.entries)}
      </Host>
    );
  }
}
