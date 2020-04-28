import {
  Component,
  h,
  Prop,
  Host,
  ComponentInterface,
  Element,
} from "@stencil/core";
import { Breakpoints } from "../../interfaces/Breakpoints.model";

@Component({
  tag: "wl-container",
  styleUrl: "wl-container.scss",
  scoped: true,
  // shadow: true,
})
export class WlContainer implements ComponentInterface {
  @Prop({ reflectToAttr: true }) size: Breakpoints = "lg";
  @Prop({ reflectToAttr: true }) maxWidth: Breakpoints = "xl";
  @Prop({ reflectToAttr: true }) fluid = false;
  @Prop({ reflectToAttr: true }) class = "";

  @Element() el!: HTMLElement;

  render() {
    const { maxWidth, fluid, size } = this;
    return (
      <Host fluid={fluid} size={size} class={this.class}>
        <div
          class={this.class}
          id="wl-container"
          //@ts-ignore
          size={size}
          maxWidth={maxWidth}
        >
          <slot></slot>
        </div>
      </Host>
    );
  }
}
