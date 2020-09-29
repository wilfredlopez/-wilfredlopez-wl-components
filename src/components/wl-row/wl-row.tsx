import { Component, ComponentInterface, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "wl-row",
  styleUrl: "wl-row.scss",
  shadow: true,
})
export class WlRow implements ComponentInterface {
  @Prop({
    reflect: true,
  })
  align: "center" | "end" | "start" | "baseline" = "center";
  render() {
    return (
      <Host align={this.align}>
        <slot></slot>
      </Host>
    );
  }
}
