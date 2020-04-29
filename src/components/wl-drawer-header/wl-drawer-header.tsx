import { Component, ComponentInterface, h, Prop, Host } from "@stencil/core";
import { Color } from "../../interfaces/Color.model";
import { createColorClasses } from "../../utils/utils";

@Component({
  tag: "wl-drawer-header",
  styleUrl: "drawer-header.scss",
  shadow: true,
})
export class WlDrawerHeader implements ComponentInterface {
  @Prop({
    reflect: true,
  })
  color?: Color;

  render() {
    return (
      <Host
        class={{
          ...createColorClasses(this.color),
        }}
      >
        <header>
          <slot></slot>
        </header>
      </Host>
    );
  }
}
