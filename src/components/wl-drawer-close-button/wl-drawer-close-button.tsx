import {
  Component,
  ComponentInterface,
  h,
  Host,
  Method,
  Prop,
  Element,
} from "@stencil/core";
import { Color } from "../../interfaces/Color.model";
import { hostContext } from "../../utils/helpers";
import { Variants } from "../../interfaces/Variants.model";
import { ComponentProps } from "../..";
import { createColorClasses } from "../../utils/utils";

@Component({
  tag: "wl-drawer-close-button",
  styleUrl: "closebutton.scss",
  shadow: true,
})
export class WlDrawerCloseButton implements ComponentInterface {
  @Prop({
    attribute: "color",
  })
  color?: Color;
  @Prop({
    attribute: "variant",
  })
  variant?: Variants;

  @Prop()
  circular?: boolean;

  @Prop()
  buttonProps?: ComponentProps<HTMLWlButtonElement>;

  @Element() el!: HTMLElement;

  @Method() async close() {
    const drawer = this.el.closest("wl-drawer");
    if (drawer) {
      drawer.close();
    }
  }

  render() {
    const buttonProps = this.buttonProps;
    return (
      <Host
        color={this.color}
        variant={this.variant}
        class={{
          ...createColorClasses(this.color),
          "in-drawer": hostContext("wl-drawer", this.el),
        }}
      >
        <wl-button
          {...buttonProps}
          color={this.color}
          variant={this.variant}
          class="close wl-no-padding"
          onClick={() => this.close()}
          circular={this.circular}
        >
          <svg
            viewBox="0 0 24 24"
            focusable="false"
            role="presentation"
            aria-hidden="true"
            class="css-1idynds"
          >
            <path
              fill="currentColor"
              d="M.439,21.44a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,1,0,2.122-2.121L14.3,12.177a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.44L12.177,9.7a.25.25,0,0,1-.354,0L2.561.44A1.5,1.5,0,0,0,.439,2.561L9.7,11.823a.25.25,0,0,1,0,.354Z"
            ></path>
          </svg>
        </wl-button>
      </Host>
    );
  }
}
