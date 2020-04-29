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

@Component({
  tag: "wl-drawer-close-button",
  styleUrl: "closebutton.scss",
  shadow: true,
})
export class WlDrawerCloseButton implements ComponentInterface {
  @Prop({
    attribute: "color",
  })
  color?: Color = "light";
  @Prop({
    attribute: "color",
  })
  variant?: Variants = "outline";
  @Element() el!: HTMLElement;

  @Method() async close() {
    const drawer = this.el.closest("wl-drawer");
    if (drawer) {
      drawer.close();
    }
  }

  render() {
    let { color, variant } = this;
    return (
      <Host
        class={{
          "in-drawer": hostContext("wl-drawer", this.el),
        }}
      >
        <wl-button
          color={color}
          variant={variant}
          class="close wl-no-padding"
          onClick={() => this.close()}
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
