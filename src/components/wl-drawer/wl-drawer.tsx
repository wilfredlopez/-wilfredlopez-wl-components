import {
  Component,
  ComponentInterface,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
} from "@stencil/core";
import { createColorClasses } from "../../utils/utils";
import { Color } from "../../interfaces/Color.model";
// import { createColorClasses } from "../../utils/utils";
// import { Color } from "../../interfaces/Color.model";

@Component({
  tag: "wl-drawer",
  styleUrl: "drawer.scss",
  shadow: true,
})
export class WlSpinner implements ComponentInterface {
  @Prop({
    reflectToAttr: true,
  })
  placement: "right" | "left" | "top" | "bottom" = "right";

  @Prop({
    reflectToAttr: true,
    mutable: true,
  })
  isOpen: boolean = false;
  @Prop({
    attribute: "color",
    reflect: true,
  })
  color?: Color = "secondary";
  buttonRef: any;

  @Event() closed!: EventEmitter;

  @Method() async onDrawerClosed() {
    this.closed.emit();
  }

  @Method() async close() {
    this.isOpen = false;
    const body = document.querySelector("body");
    body!.style.overflow = "";
    // this.onDrawerClosed();
  }

  @Method() async open() {
    this.isOpen = true;
    const body = document.querySelector("body");
    body!.style.overflow = "hidden";
  }

  render() {
    return (
      <Host
        aria-hidden={this.isOpen ? "false" : "true"}
        class={{
          "todo-list": true,
          "is-open": this.isOpen,
          ...createColorClasses(this.color),
        }}
      >
        <slot name="button-open">
          <wl-button onClick={() => this.open()}>Open</wl-button>
        </slot>
        {this.isOpen && (
          <div>
            <div id="focus-guard"></div>
            <div class="overlay-container">
              <div class="overlay" onClick={() => this.close()}>
                <div
                  class="dialog"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <slot></slot>
                </div>
              </div>
            </div>
            <div
              data-focus-guard="true"
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
          </div>
        )}
      </Host>
    );
  }
}
