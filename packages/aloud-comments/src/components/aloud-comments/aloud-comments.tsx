import { Component, Host, Prop, State, h } from '@stencil/core';
import axios, { AxiosInstance } from 'axios';
import S, { BaseSchema } from 'jsonschema-definer';

const sEntry = (S.shape({
  id: S.anyOf(S.string(), S.number()),
  author: S.string(),
  markdown: S.string(),
  children: S.list(S.custom(v => !!sEntry.validate(v)[0])).optional(),
}) as unknown) as BaseSchema<IEntry>;

export interface IEntry {
  id: string | number;
  author: string;
  markdown: string;
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

  @State() author = 'John Doe';
  @State() entries: IEntry[] = [];

  mainEditor: HTMLAloudEditorElement;

  private generateReplies(ents: IEntry[], parent = 'unknown', depth = 0) {
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
      this.entries = [
        {
          id: '1',
          author: 'Barbara Middleton',
          markdown:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor\n\n' +
            'Blandit rutrum. Nunc in tempus turpis.',
          children: [
            {
              id: '11',
              author: 'Sean Brown',
              markdown:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor\n\n' +
                'blandit rutrum. Nunc in tempus turpis.',
              children: [
                {
                  id: '111',
                  author: 'Gay Hernandez',
                  markdown: 'Vivamus quis semper metus, non tincidunt dolor. Vivamus in mi eu lorem cursus ullamcorper sit amet nec massa.',
                  children: [
                    {
                      id: '1111',
                      author: 'Shaun Davenport',
                      markdown:
                        'Morbi vitae diam et purus tincidunt porttitor vel vitae augue. Praesent malesuada metus sed pharetra euismod. Cras tellus odio, tincidunt iaculis diam non\n\n' +
                        'porta aliquet tortor.',
                    },
                  ],
                },
              ],
            },
            {
              id: '12',
              author: 'Kayli Eunice',
              markdown:
                'Sed convallis scelerisque mauris, non pulvinar nunc mattis vel. Maecenas varius felis sit amet magna vestibulum euismod malesuada cursus libero. Vestibulum ante\n\n' +
                'ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Phasellus lacinia non nisl id feugiat.',
            },
          ],
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
              <img src="https://bulma.io/images/placeholders/128x128.png" />
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
                              author: this.author,
                              markdown: v,
                            })
                            .then(({ data: { id } }) => {
                              this.entries = [
                                {
                                  id,
                                  author: this.author,
                                  markdown: v,
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
