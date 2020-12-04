import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {
  /**
   * Firebase configuration
   * @requires
   */
  @Prop() firebase: Record<string, unknown>;

  render() {
    return <h2>Hello, World! I'm</h2>;
  }
}
