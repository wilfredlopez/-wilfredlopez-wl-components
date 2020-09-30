import {
  Component,
  ComponentInterface,
  Element,
  Host,
  Prop,
  h,
  Watch,
  State,
  Event,
  EventEmitter,
} from "@stencil/core";

import { createColorClasses } from "../../utils/utils";
import { Color } from "../../interfaces/Color.model";
import { StyleEventDetail } from "../../interfaces/Inputs.model";
import { getWlMode } from "../../global/wl-global";

@Component({
  tag: "wl-label",
  // styleUrl: "wl-label.scss",
  styleUrls: {
    md: "label.md.scss",
    ios: "label.ios.scss",
  },

  scoped: true,
})
export class WlLabel implements ComponentInterface {
  @Element() el!: HTMLElement;

  /**
   * The color to use from your application's color palette.
   * Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
   * For more information on colors, see [theming](/docs/theming/basics).
   */
  @Prop() color?: Color;

  /**
   * The position determines where and how the label behaves inside an item.
   */
  @Prop() position?: "fixed" | "stacked" | "floating";

  /**
   * Emitted when the styles change.
   * @internal
   */
  @Event() wlStyle!: EventEmitter<StyleEventDetail>;

  @State() noAnimate = false;

  componentWillLoad() {
    this.noAnimate = this.position === "floating";
    this.emitStyle();
  }

  componentDidLoad() {
    if (this.noAnimate) {
      setTimeout(() => {
        this.noAnimate = false;
      }, 1000);
    }
  }

  @Watch("position")
  positionChanged() {
    this.emitStyle();
  }

  private emitStyle() {
    const position = this.position;
    this.wlStyle.emit({
      md: true,
      [`label-${position}`]: position !== undefined,
      [`label-no-animate`]: this.noAnimate,
    });
  }

  render() {
    const position = this.position;
    const mode = getWlMode(this);
    return (
      <Host
        class={{
          ...createColorClasses(this.color),
          [mode]: true,
          [`label-${position}`]: position !== undefined,
          [`label-no-animate`]: true,
        }}
      ></Host>
    );
  }
}
