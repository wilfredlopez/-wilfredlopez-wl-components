import { Component, ComponentInterface, h, Prop, Host } from "@stencil/core";
import { createColorClasses } from "../../utils/utils";
import { Color } from "../../interfaces/Color.model";

@Component({
  tag: "wl-text",
  styleUrl: "wl-text.scss",
  shadow: true,
})
export class WlText implements ComponentInterface {
  @Prop({
    reflectToAttr: true,
  })
  color?: Color = "light";

  render() {
    return (
      <Host
        class={{
          ...createColorClasses(this.color),
        }}
      >
        <slot></slot>
      </Host>
    );
  }
}
