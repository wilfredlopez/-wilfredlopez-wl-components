import { Component, ComponentInterface, h, Host } from "@stencil/core";

@Component({
  tag: "wl-drawer-body",
  styleUrl: "drawer-body.scss",
  shadow: true,
})
export class WlDrawerBody implements ComponentInterface {
  render() {
    return (
      <Host
        class={
          {
            // ...createColorClasses(this.color),
          }
        }
      >
        <slot></slot>
      </Host>
    );
  }
}
