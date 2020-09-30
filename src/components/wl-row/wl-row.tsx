import { Component, ComponentInterface, Host, h, Prop } from "@stencil/core";
import { JustificationModifier } from "../../interfaces/FlexClassModifiers.model";

@Component({
  tag: "wl-row",
  styleUrl: "wl-row.scss",
  shadow: true,
})
export class WlRow implements ComponentInterface {
  @Prop({
    reflect: true,
  })
  align?: "center" | "end" | "start" | "baseline";

  @Prop({
    reflect: true,
  })
  justify?: JustificationModifier;

  render() {
    let justify = `wl-justify-content-${this.justify}`;
    let align = `wl-align-self-${this.align}`;
    let alignItems = `wl-align-items-${this.align}`;

    return (
      <Host
        align={this.align}
        class={{
          [justify]: this.justify !== undefined,
          [align]: this.align !== undefined,
          [alignItems]: this.align !== undefined,
        }}
      >
        <slot></slot>
      </Host>
    );
  }
}
