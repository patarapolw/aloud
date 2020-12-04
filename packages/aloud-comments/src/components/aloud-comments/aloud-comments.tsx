import { Component, Prop, h, Host, State } from '@stencil/core';

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

  render() {
    return (
      <Host>
        <article class="media">
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

        <article class="media">
          <figure class="media-left">
            <p class="image is-64x64">
              <img src="https://bulma.io/images/placeholders/128x128.png" />
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <strong>Barbara Middleton</strong>
                <br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor
                blandit rutrum. Nunc in tempus turpis.
                <br />
                <small class="dot-separated">
                  <span><a>Like</a></span>
                  <span><a>Reply</a></span>
                  <span>3 hrs</span>
                </small>
              </p>
            </div>

            <article class="media">
              <figure class="media-left">
                <p class="image is-48x48">
                  <img src="https://bulma.io/images/placeholders/96x96.png" />
                </p>
              </figure>
              <div class="media-content">
                <div class="content">
                  <p>
                    <strong>Sean Brown</strong>
                    <br />
                    Donec sollicitudin urna eget eros malesuada sagittis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam
                    blandit nisl a nulla sagittis, a lobortis leo feugiat.
                    <br />
                    <small class="dot-separated">
                      <span><a>Link</a></span>
                      <span><a>Reply</a></span>
                      <span>2 hrs</span>
                    </small>
                  </p>
                </div>

                <article class="media">Vivamus quis semper metus, non tincidunt dolor. Vivamus in mi eu lorem cursus ullamcorper sit amet nec massa.</article>

                <article class="media">
                  Morbi vitae diam et purus tincidunt porttitor vel vitae augue. Praesent malesuada metus sed pharetra euismod. Cras tellus odio, tincidunt iaculis diam non, porta
                  aliquet tortor.
                </article>
              </div>
            </article>

            <article class="media">
              <figure class="media-left">
                <p class="image is-48x48">
                  <img src="https://bulma.io/images/placeholders/96x96.png" />
                </p>
              </figure>
              <div class="media-content">
                <div class="content">
                  <p>
                    <strong>Kayli Eunice </strong>
                    <br />
                    Sed convallis scelerisque mauris, non pulvinar nunc mattis vel. Maecenas varius felis sit amet magna vestibulum euismod malesuada cursus libero. Vestibulum ante
                    ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Phasellus lacinia non nisl id feugiat.
                    <br />
                    <small class="dot-separated">
                      <span><a>Like</a></span>
                      <span><a>Reply</a></span>
                      <span>2 hrs</span>
                    </small>
                  </p>
                </div>
              </div>
            </article>
          </div>
        </article>
      </Host>
    );
  }
}
