import {
  Component,
  ComponentInterface,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  Watch,
} from "@stencil/core";
import { Color } from "../../interfaces/Color.model";
import { createColorClasses } from "../../utils/utils";
// import { createColorClasses } from "../../utils/utils";
// import { Color } from "../../interfaces/Color.model";

export type Placement = "right" | "left" | "top" | "bottom";

@Component({
  tag: "wl-drawer",
  styleUrl: "drawer.scss",
  shadow: true,
})
export class WlSpinner implements ComponentInterface {
  @Prop({
    reflectToAttr: true,
  })
  placement: Placement = "left";

  @Prop({
    reflectToAttr: true,
    mutable: true,
  })
  isOpen: boolean = false;
  @Prop({
    attribute: "color",
    reflect: true,
  })
  color?: Color = "light";
  buttonRef: any;

  @Event() closed!: EventEmitter;

  @Method() async onDrawerClosed() {
    this.closed.emit();
  }

  @Method() async close() {
    this.isOpen = false;
    const body = document.querySelector("body");
    body!.style.overflow = "";
    this.onDrawerClosed();
  }

  @Method() async open() {
    this.isOpen = true;
    const body = document.querySelector("body");
    body!.style.overflow = "hidden";
  }

  private getStylesFromPlacement(placement: Placement) {
    let percent = "100%";
    if (this.isOpen) {
      percent = "0%";
    }
    let positionStyles: {
      transform: string;
      right?: string;
      left?: string;
      top?: string;
      bottom?: string;
    } = {
      transform: `translateX(+${percent})`,
      right: "0px",
    };

    let right = {
      transform: `translateX(+${percent})`,
      right: "0px",
    };
    let left = {
      transform: `translateX(-${percent})`,
      left: "0px",
    };
    let top = {
      transform: `translateY(-${percent})`,
      top: "0px",
      maxWidth: "100vw",
      height: "auto",
      left: "0px",
      right: "0px",
      bottom: "unset",
    };
    let bottom = {
      transform: `translateY(+${percent})`,
      bottom: "0px",
      maxWidth: "100vw",
      height: "auto",
      left: "0px",
      right: "0px",
      top: "unset",
    };
    switch (placement) {
      case "right":
        positionStyles = right;
        break;
      case "left":
        positionStyles = left;
        break;
      case "top":
        positionStyles = top;
        break;
      case "bottom":
        positionStyles = bottom;
        break;
      default:
        break;
    }

    return positionStyles;
  }

  @Watch("isOpen")
  watchHandler(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      if (newValue === false) {
        const body = document.querySelector("body");
        body!.style.overflow = "";
      }
    }
  }

  render() {
    let styles = this.getStylesFromPlacement(this.placement);
    return (
      <Host
        aria-hidden={this.isOpen ? "false" : "true"}
        class={{
          "is-open": this.isOpen,
          ...createColorClasses(this.color),
        }}
      >
        <slot name="button-open">
          <wl-drawer-menu-button
            onClick={() => this.open()}
          ></wl-drawer-menu-button>
          {/* <wl-button onClick={() => this.open()}>Open</wl-button> */}
        </slot>

        <div id="focus-guard"></div>
        <div class="overlay-container">
          <div
            class="overlay"
            onClick={(e) => {
              if (e.srcElement) {
                let target = e.srcElement as HTMLDivElement;
                let shouldClose = target.className === "overlay";
                if (shouldClose) {
                  this.close();
                }
              }
            }}
          >
            <div class="dialog" style={styles}>
              <slot></slot>
            </div>
          </div>
        </div>
        <div
          data-focus-guard={this.isOpen}
          tabindex="0"
          style={{
            width: "1px",
            height: "0px",
            padding: "0px",
            overflow: "hidden",
            position: "fixed",
            top: "1px",
            left: "1px",
          }}
        ></div>
      </Host>
    );
  }
}
