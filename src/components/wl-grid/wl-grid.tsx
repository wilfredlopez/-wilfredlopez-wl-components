import { Component, ComponentInterface, Host, h, Prop } from "@stencil/core";
import {
  JustificationModifier,
  AlignmentModifier,
} from "../../interfaces/FlexClassModifiers.model";

@Component({
  tag: "wl-grid",
  styleUrl: "wl-grid.scss",
  shadow: true,
})
export class WlGrid implements ComponentInterface {
  @Prop({
    reflect: true,
  })
  justify?: JustificationModifier = "between";

  @Prop({
    reflect: true,
  })
  align?: AlignmentModifier = "stretch";
  ////wl-align-items-${AlignmentModifier}
  //`wl-justify-content-${JustificationModifier}`

  /**
   * If `true`, the grid will have a fixed width based on the screen size.
   */
  @Prop() fixed = false;

  render() {
    let justify = `wl-justify-content-${this.justify}`;
    let align = `wl-align-self-${this.align}`;
    let alignItems = `wl-align-items-${this.align}`;
    return (
      <Host
        class={{
          "grid-fixed": this.fixed,
          [justify]: true,
          [align]: true,
          [alignItems]: true,
        }}
      >
        <slot></slot>
      </Host>
    );
  }
}
