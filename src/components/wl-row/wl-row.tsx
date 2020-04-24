import { Component, ComponentInterface, Host, h } from "@stencil/core";

@Component({
  tag: "wl-row",
  styleUrl: "wl-row.scss",
  shadow: true,
})
export class WlRow implements ComponentInterface {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
