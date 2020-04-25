import { Component, ComponentInterface, Host, h, Prop } from "@stencil/core";
import { Color } from "../interfaces/Color.model";

@Component({
  tag: "wl-appbar",
  styleUrl: "appbar.scss",
  shadow: true,
})
export class WlAppbar implements ComponentInterface {
  @Prop({
    attribute: "color",
    reflect: true,
  })
  color?: Color;

  render() {
    const { color } = this;
    return (
      <Host color={color}>
        <header color={color}>
          <div id="toolbar">
            <slot></slot>
          </div>
        </header>
      </Host>
    );
  }
}
