import { Component, h, Prop } from "@stencil/core";

@Component({
  tag: "wl-button",
  styleUrl: "./wl-button.css",
  shadow: true,
})
export class WlButton {
  @Prop({
    attribute: "color",
    reflect: true,
  })
  color: "primary" | "secondary";

  @Prop({
    attribute: "size",
    reflect: true,
  })
  size: "small" | "large";

  render() {
    return [
      <button<CustomButton>
        id="wl-btn"
        color={this.color}
        //@ts-ignore
        size={this.size}
      >
        <slot></slot>
      </button>,
    ];
  }
}
