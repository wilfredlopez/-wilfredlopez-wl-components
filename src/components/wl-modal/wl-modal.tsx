import { Component, h, Prop, Method } from "@stencil/core";

@Component({
  tag: "wl-modal",
  styleUrl: "./wl-modal.scss",
  shadow: true,
})
export class WlModal {
  @Prop({
    attribute: "show",
    reflect: true,
    mutable: true,
  })
  show: boolean = false;

  @Method() async close() {
    this.show = false;
  }

  @Method() async open() {
    this.show = true;
  }

  render() {
    return [
      <div
        id="backdrop"
        onClick={() => {
          this.close();
        }}
      ></div>,
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
