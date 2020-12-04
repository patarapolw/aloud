import { Component, Host, Prop, State, h } from '@stencil/core';

export interface IEntry {
  author: string;
  markdown: string;
  children?: IEntry[];
}

@Component({
  tag: 'aloud-comments',
  styleUrl: 'aloud-comments.scss',
  shadow: true,
})
export class AloudComments {
  /**
   * Firebase configuration
   * @requires
   */
  @Prop() firebase: Record<string, unknown>;

  @State() isEnterToSubmit = true;
  @State() entries: IEntry[] = [];

  private generateReplies(ents: IEntry[], parent = 'unknown', depth = 0) {
    return (
      <section>
        {ents.map(it =>
          depth > 2 ? (
            <aloud-subentry parent={parent} author={it.author} markdown={it.markdown}>
              {it.children ? this.generateReplies(it.children, it.author, depth + 1) : null}
            </aloud-subentry>
          ) : (
            <aloud-entry author={it.author} markdown={it.markdown}>
              {it.children ? this.generateReplies(it.children, it.author, depth + 1) : null}
            </aloud-entry>
          ),
        )}
      </section>
    );
  }

  componentWillLoad() {
    this.entries = [
      {
        author: 'Barbara Middleton',
        markdown:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor\n\n' +
          'Blandit rutrum. Nunc in tempus turpis.',
        children: [
          {
            author: 'Sean Brown',
            markdown:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor\n\n' +
              'blandit rutrum. Nunc in tempus turpis.',
            children: [
              {
                author: 'Gay Hernandez',
                markdown: 'Vivamus quis semper metus, non tincidunt dolor. Vivamus in mi eu lorem cursus ullamcorper sit amet nec massa.',
                children: [
                  {
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
            author: 'Kayli Eunice',
            markdown:
              'Sed convallis scelerisque mauris, non pulvinar nunc mattis vel. Maecenas varius felis sit amet magna vestibulum euismod malesuada cursus libero. Vestibulum ante\n\n' +
              'ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Phasellus lacinia non nisl id feugiat.',
          },
        ],
      },
    ];
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
                  <aloud-editor value="# hello"></aloud-editor>
                </div>
              </p>
            </div>
            <nav class="level">
              <div class="level-left">
                <div class="level-item">
                  <a class="button is-info">Submit</a>
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
