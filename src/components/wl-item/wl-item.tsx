import { Component, ComponentInterface, h, Host } from "@stencil/core";

@Component({
  tag: "wl-item",
  styleUrl: "item.scss",
  shadow: true,
})
export class WlItem implements ComponentInterface {
  render() {
    return (
      <Host>
        <wl-flex
          size="12"
          style={{
            display: "contents",
          }}
        >
          <slot></slot>
        </wl-flex>
      </Host>
    );
  }
}
