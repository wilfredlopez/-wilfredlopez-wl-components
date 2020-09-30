import { Component, ComponentInterface, Host, h, Prop } from "@stencil/core";
import { Color } from "../../interfaces/Color.model";
import {
  JustificationModifier,
  AlignmentModifier,
} from "../../interfaces/FlexClassModifiers.model";
import { TextClassModifier } from "../../interfaces/TextClassModifier.model";

@Component({
  tag: "wl-appbar",
  styleUrl: "appbar.scss",
  // shadow: true,
  scoped: true,
})
export class WlAppbar implements ComponentInterface {
  @Prop({
    attribute: "color",
    reflect: true,
  })
  color?: Color;

  @Prop() justify?: JustificationModifier = "start";
  @Prop() align?: AlignmentModifier = "stretch";
  @Prop() textAlign?: TextClassModifier = "left";
  @Prop() noPadding?: boolean = false;

  render() {
    const { color, align, justify, textAlign, noPadding } = this;
    return (
      <Host color={color} textAlign={textAlign} noPadding={noPadding}>
        <header
          color={color}
          class={`wl-justify-content-${justify} wl-align-items-${align}`}
        >
          <div id="toolbar">
            <slot></slot>
          </div>
        </header>
      </Host>
    );
  }
}
