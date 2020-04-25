import { Component, h, ComponentInterface, Host } from "@stencil/core";

@Component({
  tag: "wl-card",
  styleUrl: "card.scss",
  shadow: true,
})
export class WlCard implements ComponentInterface {
  render() {
    return (
      <Host>
        <div>
          <slot name="header"></slot>
          <slot name="content"></slot>
          <slot></slot>
        </div>
      </Host>
    );
  }
}
