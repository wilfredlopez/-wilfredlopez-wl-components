import { Component, ComponentInterface, h, Prop, Host } from "@stencil/core";

@Component({
  tag: "wl-drawer-footer",
  styleUrl: "drawer-footer.scss",
  shadow: true,
})
export class WlDrawerFooter implements ComponentInterface {
  @Prop({
    reflect: true,
  })
  fixed: boolean = false;

  render() {
    return (
      <Host
        class={{
          fixed: this.fixed,
        }}
      >
        <footer>
          <slot></slot>
        </footer>
      </Host>
    );
  }
}
