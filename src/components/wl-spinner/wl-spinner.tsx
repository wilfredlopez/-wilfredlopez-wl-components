import { Component, ComponentInterface, h, Prop, Host } from "@stencil/core";
import { createColorClasses } from "../../utils/utils";
import { Color } from "../../interfaces/Color.model";
import { SpinerVariant } from "../../interfaces/SpinerVariant.mode";

@Component({
  tag: "wl-spinner",
  styleUrl: "wl-spinner.scss",
  shadow: true,
})
export class WlSpinner implements ComponentInterface {
  @Prop({
    reflect: true,
  })
  variant: SpinerVariant = "ellipsis";

  @Prop({
    reflect: true,
  })
  color?: Color = "light";

  /**
   * @size defaults to 80px
   */
  @Prop({
    reflect: true,
  })
  size?: string = "80px";

  private matchDivCountToVariant(): Element[] {
    let loader = 8;
    let ripple = 2;
    let facebook = 3;
    let ios = 12;
    let ring = 4;
    let arr: Element[] = [];

    switch (this.variant) {
      case "loader":
        return Array.apply<any, any, any>(null, { length: loader }).map(() => {
          return <div></div>;
        });

      case "ripple":
        return Array.apply<any, any, any>(null, { length: ripple }).map(() => {
          return <div></div>;
        });
      case "ring":
      case "ellipsis":
        return Array.apply<any, any, any>(null, { length: ring }).map(() => {
          // return arr.push(<div></div>);
          return <div></div>;
        });
      case "facebook":
        return Array.apply<any, any, any>(null, { length: facebook }).map(
          () => {
            return <div></div>;
          }
        );
      case "ios":
        return Array.apply<any, any, any>(null, { length: ios }).map(() => {
          return <div></div>;
        });

      default:
        break;
    }

    return arr;
  }

  render() {
    const divsArray = this.matchDivCountToVariant();
    return (
      <Host
        style={{
          ["--size"]: `${this.size}`,
        }}
      >
        <div
          //@ts-ignore
          variant={this.variant}
          color={this.color}
          class={{
            "lds-roller": true,
            ...createColorClasses(this.color),
          }}
        >
          {...divsArray}
        </div>
      </Host>
    );
  }
}
