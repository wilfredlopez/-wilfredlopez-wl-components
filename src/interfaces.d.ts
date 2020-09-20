export * from "./components";
export * from "./index";
export * from "./interfaces";
export * from "./components/router/utils/interface";

export { createAnimation } from "./animation/animation";
export { iosTransitionAnimation } from "./transition/ios.transition";
export { mdTransitionAnimation } from "./transition/md.transition";
export { getTimeGivenProgression } from "./animation/cubic-bezier";
export { createGesture } from "./gesture";
export { isPlatform, Platforms, getPlatforms } from "./utils/platform";
export * from "./utils/framework-delegate";
export * from "./global/config";
export * from "./global/wl-config";
export * from "./components/nav/constants";
export { Gesture, GestureConfig, GestureDetail } from "./gesture";

// Types from utils
export {
  Animation,
  AnimationBuilder,
  AnimationCallbackOptions,
  AnimationDirection,
  AnimationFill,
  AnimationKeyFrames,
  AnimationLifecycle,
} from "./animation/animation-interface";

export type TextFieldTypes =
  | "date"
  | "email"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "url"
  | "time";
export type Side = "start" | "end";
export type PredefinedColors =
  | "primary"
  | "secondary"
  | "tertiary"
  | "success"
  | "warning"
  | "danger"
  | "light"
  | "medium"
  | "dark";
export type Color = PredefinedColors | string;
export type Mode = "ios" | "md";
export type ComponentTags = string;
export type ComponentRef = Function | HTMLElement | string | null;
export type ComponentProps<T = any> = { [key: string]: T };
export type BackButtonEvent = CustomEvent<BackButtonEventDetail>;

export interface FrameworkDelegate {
  attachViewToDom(
    container: any,
    component: any,
    propsOrDataObj?: any,
    cssClasses?: string[]
  ): Promise<HTMLElement>;
  removeViewFromDom(container: any, component: any): Promise<void>;
}

export interface BackButtonEventDetail {
  register(priority: number, handler: () => Promise<any> | void): void;
}

export interface StyleEventDetail {
  [styleName: string]: boolean;
}

declare module "./components" {
  export namespace Components {}
}
