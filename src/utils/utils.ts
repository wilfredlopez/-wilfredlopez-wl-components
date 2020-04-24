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

export const SIZE_TO_MEDIA: any = {
  xs: "(min-width: 0px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)",
};

// Check if the window matches the media query
// at the breakpoint passed
// e.g. matchBreakpoint('sm') => true if screen width exceeds 576px
export const matchBreakpoint = (breakpoint: string | undefined) => {
  if (breakpoint === undefined || breakpoint === "") {
    return true;
  }
  if ((window as any).matchMedia) {
    const mediaQuery = SIZE_TO_MEDIA[breakpoint];
    return window.matchMedia(mediaQuery).matches;
  }
  return false;
};
