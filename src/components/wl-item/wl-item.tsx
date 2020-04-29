import {
  Component,
  ComponentInterface,
  Element,
  Host,
  Listen,
  Prop,
  State,
  forceUpdate,
  h,
} from "@stencil/core";

import { createColorClasses, CssClassMap } from "../../utils/utils";
import { ButtonInterface } from "../../interfaces/ButtonType";
import { LinkInterface } from "../../interfaces/LinkInterface";
import { Color } from "../../interfaces/Color.model";
import { StyleEventDetail } from "../../interfaces/Inputs.model";
import { hostContext } from "../../utils/helpers";

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @slot - Content is placed between the named slots if provided without a slot.
 * @slot start - Content is placed to the left of the item text in LTR, and to the right in RTL.
 * @slot end - Content is placed to the right of the item text in LTR, and to the left in RTL.
 */
@Component({
  tag: "wl-item",
  styleUrl: "itemStyles.scss",
  shadow: true,
})
export class WlItem
  implements ComponentInterface, LinkInterface, ButtonInterface {
  private itemStyles = new Map<string, CssClassMap>();

  @Element() el!: HTMLWlItemElement;

  @State() multipleInputs = false;

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
   * If `true`, a button tag will be rendered and the item will be tappable.
   */
  @Prop() button = false;

  /**
   * If `true`, the user cannot interact with the item.
   */
  @Prop() disabled = false;

  /**
   * This attribute instructs browsers to download a URL instead of navigating to
   * it, so the user will be prompted to save it as a local file. If the attribute
   * has a value, it is used as the pre-filled file name in the Save prompt
   * (the user can still change the file name if they want).
   */
  @Prop() download: string | undefined;

  /**
   * Contains a URL or a URL fragment that the hyperlink points to.
   * If this property is set, an anchor tag will be rendered.
   */
  @Prop() href: string | undefined;

  /**
   * Specifies the relationship of the target object to the link object.
   * The value is a space-separated list of [link types](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).
   */
  @Prop() rel: string | undefined;

  /**
   * How the bottom border should be displayed on the item.
   */
  @Prop() lines?: "full" | "inset" | "none";

  /**
   * Specifies where to display the linked URL.
   * Only applies when an `href` is provided.
   * Special keywords: `"_blank"`, `"_self"`, `"_parent"`, `"_top"`.
   */
  @Prop() target: string | undefined;

  /**
   * The type of the button. Only used when an `onclick` or `button` property is present.
   */
  @Prop() type: "submit" | "reset" | "button" = "button";

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

  componentDidLoad() {
    // The following elements can accept focus alongside the previous elements
    // therefore if these elements are also a child of item, we don't want the
    // input cover on top of those interfering with their clicks
    const inputs = this.el.querySelectorAll("wl-input");

    // The following elements should also stay clickable when an input with cover is present
    const clickables = this.el.querySelectorAll("wl-button, a, button");

    // Check for multiple inputs to change the position of the input cover to relative
    // for all of the covered inputs above
    this.multipleInputs =
      inputs.length > 1 || (clickables.length > 1 && this.isClickable());
  }

  // If the item has an href or button property it will render a native
  // anchor or button that is clickable
  private isClickable(): boolean {
    return this.href !== undefined || this.button;
  }

  private canActivate(): boolean {
    return this.isClickable();
  }

  render() {
    const { download, lines, disabled, href, rel, target } = this;
    const childStyles = {};
    const clickable = this.isClickable();
    const canActivate = this.canActivate();
    const TagType = clickable
      ? href === undefined
        ? "button"
        : "a"
      : ("div" as any);
    const attrs =
      TagType === "button"
        ? { type: this.type }
        : {
            download,
            href,
            rel,
            target,
          };
    this.itemStyles.forEach((value) => {
      Object.assign(childStyles, value);
    });

    return (
      <Host
        aria-disabled={disabled ? "true" : null}
        class={{
          ...childStyles,
          ...createColorClasses(this.color),
          item: true,
          ["md"]: true,
          [`item-lines-${lines}`]: lines !== undefined,
          "item-disabled": disabled,
          "in-drawer": hostContext("wl-drawer", this.el),
          "item-multiple-inputs": this.multipleInputs,
          "wl-activatable": canActivate,
          "wl-focusable": true,
        }}
      >
        <TagType {...attrs} class="item-native" disabled={disabled}>
          <slot name="start"></slot>
          <div class="item-inner">
            <div class="input-wrapper">
              <slot></slot>
            </div>
            <slot name="end"></slot>
            <div class="item-inner-highlight"></div>
          </div>
        </TagType>
        <div class="item-highlight"></div>
      </Host>
    );
  }
}
