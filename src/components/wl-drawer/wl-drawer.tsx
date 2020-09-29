import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State,
  Watch,
} from "@stencil/core";
import { getWlMode } from "../../global/wl-global";

import { Color } from "../../interfaces/Color.model";

import { createColorClasses } from "../../utils/utils";

export type Placement = "right" | "left" | "top" | "bottom";

interface PositionStyles {
  right?: string;
  left?: string;
  top?: string;
  bottom?: string;
  transform: string;
}

@Component({
  tag: "wl-drawer",
  styleUrl: "drawer.scss",
  shadow: true,
})
export class WlDrawer implements ComponentInterface {
  @Prop({
    reflect: true,
  })
  placement: Placement = "left";

  @Prop({
    reflect: true,
    mutable: true,
  })
  isOpen: boolean = false;
  @Prop({
    attribute: "color",
    reflect: true,
  })
  @Prop({
    reflect: true,
    mutable: true,
  })
  disabled?: boolean;
  color?: Color = "light";
  buttonRef: any;

  OverlayContainer?: HTMLElement;
  overlayElement?: HTMLElement;
  Dialog?: HTMLElement;
  @Element() el!: HTMLWlDrawerElement;

  @State() transform = "";

  @Event() drawerOpenStateChange!: EventEmitter<{ isOpen: boolean }>;

  getStylesFromPlacement(placement: Placement) {
    let percent = "100%";
    if (this.isOpen) {
      percent = "0%";
    }
    let positionStyles: PositionStyles = {
      transform: `translateX(+${percent})`,
      right: "0px",
    };

    const rightPercent = window.innerWidth - (this.Dialog?.clientWidth || 300);

    let right = {
      transform: `translateX(${rightPercent}px)`,
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
        this.transform = right.transform;
        break;
      case "left":
        positionStyles = left;
        this.transform = left.transform;
        break;
      case "top":
        this.transform = top.transform;
        positionStyles = top;
        break;
      case "bottom":
        this.transform = bottom.transform;
        positionStyles = bottom;
        break;
      default:
        break;
    }
    return positionStyles as { [key: string]: any };
  }

  @Method() async close() {
    this.isOpen = false;
  }

  isAnimating = false;

  @Method() async open() {
    this.isOpen = true;
  }

  //toggle body overflow hidden
  private setBodyOverflow(value: "hidden" | "") {
    const body = document.querySelector("body");
    body!.style.overflow = value;
  }

  // width!: number; // TODO
  isEndSide: boolean = false;

  disconnectedCallback() {
    this.setBodyOverflow("");
    this.drawerOpenStateChange.emit({ isOpen: this.isOpen });
  }

  @Watch("isOpen")
  watchHandler(newValue: boolean, oldValue: boolean) {
    this.drawerOpenStateChange.emit({
      isOpen: newValue,
    });

    if (newValue === oldValue && newValue === false) {
      this.setBodyOverflow(""); // reset overflow
    }

    if (newValue !== oldValue) {
      if (newValue === false) {
        animate(this, false); //doing the overflow in animate.
        // this.setBodyOverflow("");
      } else {
        // this.setBodyOverflow("hidden");
        animate(this, true); //doing the overflow in animate.
        this.drawerOpenStateChange.emit({
          isOpen: true,
        });
      }
    }
  }

  render() {
    let styles = this.getStylesFromPlacement(this.placement);
    const mode = getWlMode(this);
    return (
      <Host
        role="navigation"
        aria-hidden={this.isOpen ? "false" : "true"}
        class={{
          "is-open": this.isOpen,
          [mode]: true,
          ...createColorClasses(this.color),
        }}
      >
        <slot name="button-open">
          <wl-drawer-menu-button
            onClick={() => this.open()}
          ></wl-drawer-menu-button>
        </slot>

        <div id="focus-guard"></div>
        <div
          class="overlay-container"
          ref={(el) => (this.OverlayContainer = el)}
        >
          <div
            ref={(el) => (this.overlayElement = el)}
            class="overlay"
            onClick={(e) => {
              if (e.target) {
                // let target = e.srcElement as HTMLDivElement;
                const target = e.target as HTMLDivElement;
                let shouldClose = target.className === "overlay";
                if (shouldClose) {
                  this.close();
                }
              }
            }}
          >
            <div class="dialog" style={styles} ref={(el) => (this.Dialog = el)}>
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

// const iosEasing = 'cubic-bezier(0.32,0.72,0,1)';
// const mdEasing = 'cubic-bezier(0.0,0.0,0.2,1)';
// const iosEasingReverse = 'cubic-bezier(1, 0, 0.68, 0.28)';
// const mdEasingReverse = 'cubic-bezier(0.4, 0, 0.6, 1)';

function setBodyOverflow(value: "hidden" | "") {
  const body = document.querySelector("body");
  body!.style.overflow = value;
}

async function animate(drawer: WlDrawer, open: boolean) {
  const overlayContainer = drawer.OverlayContainer!;
  const overlay = drawer.overlayElement!;
  const dialog = drawer.Dialog!;
  const transform = drawer.transform;
  const width = window.innerWidth - dialog.clientWidth;
  let replace = "-100%";
  if (drawer.placement === "right") {
    replace = `${width}px`;
  }
  // const placement = drawer.getStylesFromPlacement(drawer.placement) as PositionStyles
  if (open) {
    setBodyOverflow("hidden");
    overlayContainer.style.transform = "translate(0%)";
    overlayContainer.style.opacity = "1";
    overlay.style.transform = "translate(0%)";
    dialog.style.transform = transform; // 'translateX(0%)'
    dialog.style.opacity = "1";
  } else {
    setBodyOverflow("");
    await sleep(100);
    overlayContainer.style.opacity = "0";
    dialog.style.transform = transform.replace("0%", replace);
    dialog.style.opacity = "0";
    await sleep(400);
    overlayContainer.style.transform = "translate(-100%)";
    overlay.style.transform = "translate(-100%)";
  }
}
function sleep(n: number) {
  return new Promise((r) => setTimeout(r, n));
}

// const SHOW_MENU = 'show-menu';
// const SHOW_BACKDROP = 'show-backdrop';
