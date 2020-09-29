import { Component, Host, h, Prop, Element } from "@stencil/core";
import { Variants } from "../../interfaces/Variants.model";
import { Color } from "../../interfaces/Color.model";

@Component({
  tag: "wl-drawer-menu-button",
  styleUrl: "drawer-menu-button.scss",
  shadow: true,
})
export class WlDrawerMenuButton {
  @Prop({ reflect: true }) variant?: Variants = "clear";
  @Prop({
    reflect: true,
  })
  color?: Color = "dark";

  @Prop({
    attribute: "size",
    reflect: true,
  })
  size?: "sm" | "lg" | "xl";
  @Element() el!: HTMLElement;

  private onClick = async (ev: Event) => {
    const drawer = this.el.closest("wl-drawer");
    ev.preventDefault();

    if (drawer && !drawer.isOpen) {
      drawer.open();
      return;
    }
    if (drawer && drawer.isOpen) {
      drawer.close();
      return;
    }
  };

  render() {
    const { size, color, variant } = this;
    return (
      <Host size={size} color={color} variant={variant}>
        <wl-button
          onClick={(e) => this.onClick(e)}
          size={size}
          color={color}
          variant={variant}
        >
          <span class="label">
            <svg
              class="svg-icon"
              focusable="false"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
            </svg>
          </span>
          <span class="root">
            <slot></slot>
          </span>
        </wl-button>
      </Host>
    );
  }
}
