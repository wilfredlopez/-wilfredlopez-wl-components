import {
  Component,
  h,
  Prop,
  // Host,
  ComponentInterface,
  Element,
} from "@stencil/core";
// import { createColorClasses } from "../../utils/utils";
import { Color } from "../interfaces/Color.model";
import { ButtonInterface } from "../interfaces/ButtonType";

@Component({
  tag: "wl-button",
  styleUrl: "./wl-button.scss",
  // scoped: true,
  shadow: true,
})
export class WlButton implements ComponentInterface, ButtonInterface {
  /**
   * The type of the button.
   */
  @Prop() type: "submit" | "reset" | "button" = "button";
  /**
   * If `true`, the user cannot interact with the button.
   */
  @Prop({ reflectToAttr: true }) disabled = false;
  @Prop({ reflectToAttr: true }) squared = false;
  @Prop({ reflectToAttr: true }) variant: "outline" | "filled" | "clear" =
    "filled";
  @Prop({
    attribute: "color",
    reflect: true,
  })
  color: Color = "light";

  @Prop({
    attribute: "size",
    reflect: true,
  })
  size: "small" | "large" | "default" = "default";
  @Element() el!: HTMLElement;

  private handleClick = (ev: Event) => {
    if (this.type === "submit") {
      const form = this.el.closest("form");
      if (form) {
        ev.preventDefault();

        const fakeButton = document.createElement("button");
        fakeButton.type = this.type;
        fakeButton.style.display = "none";
        form.appendChild(fakeButton);
        fakeButton.click();
        fakeButton.remove();
      }
    } else {
      // const fakeButton = document.createElement("button");
      // fakeButton.type = this.type;
      // fakeButton.style.display = "none";
      // fakeButton.click();
      // fakeButton.remove();
    }
  };

  render() {
    const { type, disabled } = this;
    return [
      <button
        type={type}
        onClick={this.handleClick}
        aria-disabled={disabled ? "true" : null}
        // class={{
        //   ...createColorClasses(this.color),
        // }}
        class={`wl-color-${this.color}`}
        color={this.color}
        //@ts-ignore
        size={this.size}
        squared={this.squared}
        variant={this.variant}
        id="wl-btn"
      >
        <slot></slot>
      </button>,
    ];
  }
}
