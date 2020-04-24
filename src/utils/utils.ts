import { Color } from "../components/interfaces/Color.model";

export function format(first: string, middle: string, last: string): string {
  return (
    (first || "") + (middle ? ` ${middle}` : "") + (last ? ` ${last}` : "")
  );
}

export type CssClassMap = { [className: string]: boolean };
/**
 * Create the mode and color classes for the component based on the classes passed in
 */
export const createColorClasses = (
  color: Color | undefined | null
): CssClassMap | undefined => {
  return typeof color === "string" && color.length > 0
    ? {
        "wl-color": true,
        [`wl-color-${color}`]: true,
      }
    : undefined;
};
