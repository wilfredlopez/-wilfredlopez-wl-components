import { Component, ComponentInterface, h, Prop, Host } from "@stencil/core";
import { Color } from "../../interfaces/Color.model";
import { createColorClasses } from "../../utils/utils";

@Component({
  tag: "wl-drawer-footer",
  styleUrl: "drawer-footer.scss",
  shadow: true,
})
export class WlDrawerFooter implements ComponentInterface {
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
        <footer>
          <slot></slot>
        </footer>
      </Host>
    );
  }
}
