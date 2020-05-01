import {
  Component,
  ComponentInterface,
  Element,
  Host,
  //Method,
  Prop,
  h,
} from "@stencil/core";

@Component({
  tag: "wl-list",
  styleUrl: "wl-list-bundle.scss",
})
export class WlList implements ComponentInterface {
  @Element() el!: HTMLElement;

  /**
   * How the bottom border should be displayed on all items.
   */
  @Prop() lines?: "full" | "inset" | "none";

  /**
   * If `true`, the list will have margin around it and rounded corners.
   */
  @Prop() inset = false;

  render() {
    const { lines, inset } = this;
    let mode = "md";
    return (
      <Host
        class={{
          [mode]: true,

          // Used internally for styling
          [`list-${mode}`]: true,

          "list-inset": inset,
          [`list-lines-${lines}`]: lines !== undefined,
          [`list-${mode}-lines-${lines}`]: lines !== undefined,
        }}
      ></Host>
    );
  }
}
