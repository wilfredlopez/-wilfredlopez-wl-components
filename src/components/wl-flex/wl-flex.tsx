import {
  Component,
  ComponentInterface,
  Host,
  h,
  Prop,
  Listen,
  forceUpdate,
} from "@stencil/core";
import {
  JustificationModifier,
  AlignmentModifier,
  WrapType,
} from "../../interfaces/FlexClassModifiers.model";
import { matchBreakpoint } from "../../utils/utils";

const win = window as any;
const SUPPORTS_VARS = !!(
  win.CSS &&
  win.CSS.supports &&
  win.CSS.supports("--a: 0")
);
const BREAKPOINTS = ["", "xs", "sm", "md", "lg", "xl"];

@Component({
  tag: "wl-flex",
  styleUrl: "flex.scss",
  shadow: true,
})
export class WlFlex implements ComponentInterface {
  @Prop({
    reflect: true,
  })
  justify?: JustificationModifier = "between";

  @Prop({
    reflect: true,
  })
  align?: AlignmentModifier = "stretch";
  ////wl-align-items-${AlignmentModifier}
  //`wl-justify-content-${JustificationModifier}`

  @Prop({
    reflect: true,
  })
  wrap?: WrapType = "wrap";

  // .wl-nowrap	flex-wrap: nowrap	Items will all be on one line.
  //.wl-wrap	flex-wrap: wrap	Items will wrap onto multiple lines, from top to bottom.
  //.wl-wrap-reverse

  /**
   * The size of the column, in terms of how many columns it should take up out of the total
   * available. If `"auto"` is passed, the column will be the size of its content.
   */
  @Prop() size?: string;

  /**
   * The size of the column for xs screens, in terms of how many columns it should take up out
   * of the total available. If `"auto"` is passed, the column will be the size of its content.
   */
  @Prop() sizeXs?: string;

  /**
   * The size of the column for sm screens, in terms of how many columns it should take up out
   * of the total available. If `"auto"` is passed, the column will be the size of its content.
   */
  @Prop() sizeSm?: string;

  /**
   * The size of the column for md screens, in terms of how many columns it should take up out
   * of the total available. If `"auto"` is passed, the column will be the size of its content.
   */
  @Prop() sizeMd?: string;

  /**
   * The size of the column for lg screens, in terms of how many columns it should take up out
   * of the total available. If `"auto"` is passed, the column will be the size of its content.
   */
  @Prop() sizeLg?: string;

  /**
   * The size of the column for xl screens, in terms of how many columns it should take up out
   * of the total available. If `"auto"` is passed, the column will be the size of its content.
   */
  @Prop() sizeXl?: string;

  /**
   * The amount to offset the column, in terms of how many columns it should shift to the end
   * of the total available.
   */
  @Prop() offset?: string;

  /**
   * The amount to offset the column for xs screens, in terms of how many columns it should shift
   * to the end of the total available.
   */
  @Prop() offsetXs?: string;

  /**
   * The amount to offset the column for sm screens, in terms of how many columns it should shift
   * to the end of the total available.
   */
  @Prop() offsetSm?: string;

  /**
   * The amount to offset the column for md screens, in terms of how many columns it should shift
   * to the end of the total available.
   */
  @Prop() offsetMd?: string;

  /**
   * The amount to offset the column for lg screens, in terms of how many columns it should shift
   * to the end of the total available.
   */
  @Prop() offsetLg?: string;

  /**
   * The amount to offset the column for xl screens, in terms of how many columns it should shift
   * to the end of the total available.
   */
  @Prop() offsetXl?: string;

  /**
   * The amount to pull the column, in terms of how many columns it should shift to the start of
   * the total available.
   */
  @Prop() pull?: string;

  /**
   * The amount to pull the column for xs screens, in terms of how many columns it should shift
   * to the start of the total available.
   */
  @Prop() pullXs?: string;
  /**
   * The amount to pull the column for sm screens, in terms of how many columns it should shift
   * to the start of the total available.
   */
  @Prop() pullSm?: string;
  /**
   * The amount to pull the column for md screens, in terms of how many columns it should shift
   * to the start of the total available.
   */
  @Prop() pullMd?: string;
  /**
   * The amount to pull the column for lg screens, in terms of how many columns it should shift
   * to the start of the total available.
   */
  @Prop() pullLg?: string;
  /**
   * The amount to pull the column for xl screens, in terms of how many columns it should shift
   * to the start of the total available.
   */
  @Prop() pullXl?: string;

  /**
   * The amount to push the column, in terms of how many columns it should shift to the end
   * of the total available.
   */
  @Prop() push?: string;

  /**
   * The amount to push the column for xs screens, in terms of how many columns it should shift
   * to the end of the total available.
   */
  @Prop() pushXs?: string;

  /**
   * The amount to push the column for sm screens, in terms of how many columns it should shift
   * to the end of the total available.
   */
  @Prop() pushSm?: string;

  /**
   * The amount to push the column for md screens, in terms of how many columns it should shift
   * to the end of the total available.
   */
  @Prop() pushMd?: string;

  /**
   * The amount to push the column for lg screens, in terms of how many columns it should shift
   * to the end of the total available.
   */
  @Prop() pushLg?: string;

  /**
   * The amount to push the column for xl screens, in terms of how many columns it should shift
   * to the end of the total available.
   */
  @Prop() pushXl?: string;

  @Listen("resize", { target: "window" })
  onResize() {
    forceUpdate(this);
  }

  // Loop through all of the breakpoints to see if the media query
  // matches and grab the column value from the relevant prop if so
  private getColumns(property: string) {
    let matched;

    for (const breakpoint of BREAKPOINTS) {
      const matches = matchBreakpoint(breakpoint);

      // Grab the value of the property, if it exists and our
      // media query matches we return the value
      const columns = (this as any)[
        property + breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)
      ];

      if (matches && columns !== undefined) {
        matched = columns;
      }
    }

    // Return the last matched columns since the breakpoints
    // increase in size and we want to return the largest match
    return matched;
  }

  private calculateSize() {
    const columns = this.getColumns("size");

    // If size wasn't set for any breakpoint
    // or if the user set the size without a value
    // it means we need to stick with the default and return

    if (!columns || columns === "") {
      return;
    }

    // If the size is set to auto then don't calculate a size
    const colSize =
      columns === "auto"
        ? "auto"
        : // If CSS supports variables we should use the grid columns var
        SUPPORTS_VARS
        ? `calc(calc(${columns} / var(--wl-grid-columns, 12)) * 100%)`
        : // Convert the columns to a percentage by dividing by the total number
          // of columns (12) and then multiplying by 100
          (columns / 12) * 100 + "%";

    return {
      flex: `0 0 ${colSize}`,
      width: `${colSize}`,
      "max-width": `${colSize}`,
    };
  }

  // Called by push, pull, and offset since they use the same calculations
  private calculatePosition(property: string, modifier: string) {
    const columns = this.getColumns(property);

    if (!columns) {
      return;
    }

    // If the number of columns passed are greater than 0 and less than
    // 12 we can position the column, else default to auto
    const amount = SUPPORTS_VARS
      ? // If CSS supports variables we should use the grid columns var
        `calc(calc(${columns} / var(--wl-grid-columns, 12)) * 100%)`
      : // Convert the columns to a percentage by dividing by the total number
      // of columns (12) and then multiplying by 100
      columns > 0 && columns < 12
      ? (columns / 12) * 100 + "%"
      : "auto";

    return {
      [modifier]: amount,
    };
  }

  private calculateOffset(isRTL: boolean) {
    return this.calculatePosition(
      "offset",
      isRTL ? "margin-right" : "margin-left"
    );
  }
  private calculatePull(isRTL: boolean) {
    return this.calculatePosition("pull", isRTL ? "left" : "right");
  }

  private calculatePush(isRTL: boolean) {
    return this.calculatePosition("push", isRTL ? "right" : "left");
  }

  render() {
    let justify = `wl-justify-content-${this.justify}`;
    let align = `wl-align-self-${this.align}`;
    let alignItems = `wl-align-items-${this.align}`;
    let wrapping = `wl-${this.wrap}`;
    const isRTL = document.dir === "rtl";
    return (
      <Host
        class={{
          [justify]: true,
          [align]: true,
          [alignItems]: true,
          [wrapping]: true,
        }}
        style={{
          ...this.calculateSize(),
          ...this.calculateOffset(isRTL),
          ...this.calculatePull(isRTL),
          ...this.calculatePush(isRTL),
        }}
      >
        <slot></slot>
      </Host>
    );
  }
}
