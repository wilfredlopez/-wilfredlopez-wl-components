import { Component, h, Prop, Method } from "@stencil/core";

@Component({
  tag: "wl-modal",
  styleUrl: "./wl-modal.css",
  shadow: true,
})
export class WlModal {
  @Prop({
    attribute: "show",
    reflect: true,
    mutable: true,
  })
  show: boolean;

  @Method() async close() {
    return (this.show = false);
  }

  @Method() async open() {
    return new Promise((resolve, _reject) => {
      this.show = true;
      return resolve(true);
    });
  }

  render() {
    return [
      <div id="backdrop"></div>,
      <div id="modal">
        <header>
          <slot name="title">
            <h1>Title</h1>
          </slot>
        </header>
        <div id="content">
          <slot></slot>
        </div>

        <div id="actions">
          <div id="action-data">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>,
    ];
  }
}
