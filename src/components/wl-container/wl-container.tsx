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
  @Prop({ reflect: true }) size: Breakpoints = "lg";
  @Prop({ reflect: true }) maxWidth: Breakpoints = "xl";
  @Prop({ reflect: true }) fluid = false;
  @Prop({ reflect: true }) class = "";

  @Element() el!: HTMLWlContainerElement;

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
