import { Component, ComponentInterface, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "wl-grid",
  styleUrl: "wl-grid.scss",
  shadow: true,
})
export class WlGrid implements ComponentInterface {
  /**
   * If `true`, the grid will have a fixed width based on the screen size.
   */
  @Prop() fixed = false;

  render() {
    return (
      <Host
        class={{
          "grid-fixed": this.fixed,
        }}
      >
        <slot></slot>
      </Host>
    );
  }
}
