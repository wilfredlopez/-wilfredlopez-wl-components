import { Component, ComponentInterface, h, Host } from "@stencil/core";

@Component({
  tag: "wl-drawer-content",
  styleUrl: "drawer-content.scss",
  shadow: true,
})
export class WlDrawerContent implements ComponentInterface {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
