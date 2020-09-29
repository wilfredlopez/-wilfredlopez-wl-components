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
    reflect: true,
  })
  color?: Color = "light";

  @Prop({
    reflect: true,
  })
  size?: string;

  render() {
    return (
      <Host
        style={
          this.size
            ? {
                fontSize: this.size,
              }
            : {}
        }
        class={{
          ...createColorClasses(this.color),
        }}
      >
        <slot></slot>
      </Host>
    );
  }
}
