import {
  Component,
  ComponentInterface,
  forceUpdate,
  h,
  Host,
  Listen,
  Prop,
} from "@stencil/core";
import { Color } from "../../interfaces/Color.model";
import { StyleEventDetail } from "../../interfaces/Inputs.model";
import { createColorClasses, CssClassMap } from "../../utils/utils";

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @slot - Content is placed between the named slots if provided without a slot.
 * @slot start - Content is placed to the left of the item text in LTR, and to the right in RTL.
 * @slot end - Content is placed to the right of the item text in LTR, and to the left in RTL.
 */
@Component({
  tag: "wl-title",
  styleUrl: "wl-title.scss",
  shadow: true,
})
export class WlTitle implements ComponentInterface {
  private itemStyles = new Map<string, CssClassMap>();

  /**
   * The color to use from your application's color palette.
   * Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
   * For more information on colors, see [theming](/docs/theming/basics).
   */
  @Prop({
    reflect: true,
  })
  color?: Color;

  /**
   * Contains a URL or a URL fragment that the hyperlink points to.
   * If this property is set, an anchor tag will be rendered.
   */
  @Prop() component: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" = "h1";
  @Prop({
    attribute: "size",
    reflect: true,
  })
  size?: "sm" | "lg" | "xl" | "md" = "md";

  @Listen("wlStyle")
  itemStyle(ev: CustomEvent<StyleEventDetail>) {
    ev.stopPropagation();

    const tagName = (ev.target as HTMLElement).tagName;
    const updatedStyles = ev.detail;
    const newStyles = {} as any;
    const childStyles = this.itemStyles.get(tagName) || {};

    let hasStyleChange = false;
    Object.keys(updatedStyles).forEach((key) => {
      if (updatedStyles[key]) {
        const itemKey = `item-${key}`;
        if (!childStyles[itemKey]) {
          hasStyleChange = true;
        }
        newStyles[itemKey] = true;
      }
    });
    if (
      !hasStyleChange &&
      Object.keys(newStyles).length !== Object.keys(childStyles).length
    ) {
      hasStyleChange = true;
    }
    if (hasStyleChange) {
      this.itemStyles.set(tagName, newStyles);
      forceUpdate(this);
    }
  }

  render() {
    const childStyles = {};
    const TagType = this.component;

    this.itemStyles.forEach((value) => {
      Object.assign(childStyles, value);
    });

    const Props: { [key: string]: any } = {
      color: this.color,
      size: this.size,
    };
    return (
      <Host
        {...Props}
        class={{
          ...childStyles,
          ...createColorClasses(this.color),
        }}
      >
        <TagType class="title-native" {...Props}>
          <slot name="start"></slot>
          <slot></slot>
          <slot name="end"></slot>
        </TagType>
      </Host>
    );
  }
}
