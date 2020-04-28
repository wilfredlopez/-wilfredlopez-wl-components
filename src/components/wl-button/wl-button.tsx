import {
  Component,
  h,
  Prop,
  ComponentInterface,
  Element,
  Host,
} from "@stencil/core";
import { createColorClasses } from "../../utils/utils";
import { Color } from "../../interfaces/Color.model";
import { ButtonInterface } from "../../interfaces/ButtonType";
import { Variants } from "../../interfaces/Variants.model";

@Component({
  tag: "wl-button",
  styleUrl: "wl-button.scss",
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
  @Prop({ reflectToAttr: true }) circular = false;
  @Prop({ reflectToAttr: true }) variant: Variants = "block";
  @Prop({
    attribute: "color",
    reflect: true,
  })
  color?: Color = "primary";
  @Prop({ reflectToAttr: true }) href?: string;
  /**
   * Specifies where to display the linked URL.
   * Only applies when an `href` is provided.
   * Special keywords: `"_blank"`, `"_self"`, `"_parent"`, `"_top"`.
   */
  @Prop({ reflectToAttr: true }) target?: string;

  /**
   * Specifies the relationship of the target object to the link object.
   * The value is a space-separated list of [link types](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).
   */
  @Prop({ reflectToAttr: true }) rel?: string;

  @Prop({
    attribute: "size",
    reflect: true,
  })
  size?: "sm" | "lg" | "xl";
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
    } else if (typeof this.href !== "undefined") {
      ev.preventDefault();
      const fakeLink = document.createElement("a");
      fakeLink.href = this.href || "";
      fakeLink.target = this.target || "";
      fakeLink.rel = this.rel || "";
      fakeLink.style.display = "none";
      fakeLink.click();
      fakeLink.remove();
    }
  };

  render() {
    const { type, disabled, rel, target, size, href, color } = this;

    const attrs =
      type === "button"
        ? { type }
        : {
            href,
            rel,
            target,
          };
    // const finalSize = size === undefined && this.size ? "small" : size;
    const TagType = href === undefined ? "button" : ("a" as any);
    const sharedProps: { [key: string]: any } = {
      color: color,
      size: size,
      circular: this.circular,

      variant: this.variant,
    };
    if (TagType === "a") {
      sharedProps.href = href;
    } else {
      sharedProps.type = type;
      sharedProps.disabled = disabled;
      sharedProps["aria-disabled"] = disabled ? "true" : null;
    }
    return (
      <Host
        {...sharedProps}
        onClick={this.handleClick}
        aria-disabled={disabled ? "true" : null}
        class={{
          ...createColorClasses(color),
          "button-disabled": disabled,
        }}
        // class={`wl-color-${this.color}`}
        {...attrs}
      >
        <TagType
          {...sharedProps}
          {...attrs}
          class={{ "button-native": true, "button-disabled": disabled }}
        >
          <slot name="start"></slot>
          <slot></slot>
          <slot name="end"></slot>
        </TagType>
      </Host>
    );
  }
}
