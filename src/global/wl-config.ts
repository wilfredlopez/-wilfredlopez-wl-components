import { AnimationBuilder, Mode } from "../interfaces";
import { SpinerVariant } from "../interfaces/SpinerVariant.mode";

export interface WlConfig {
  /**
   * When it's set to `false`, disables all animation and transition across the app.
   * Can be useful to make wl smoother in slow devices, when animations can't run smoothly.
   */
  animated?: boolean;

  /**
   * When it's set to `false`, it disables all material-design ripple-effects across the app.
   * Defaults to `true`.
   */
  rippleEffect?: boolean;

  /**
   * The mode determines which platform styles to use for the whole application.
   */
  mode?: Mode;

  /**
   * Wherever wl will respond to hardware go back buttons in an Android device.
   * Defaults to `true` when wl runs in a mobile device.
   */
  hardwareBackButton?: boolean;

  /**
   * Whenever clicking the top status bar should cause the scroll to top in an application.
   * Defaults to `true` when wl runs in a mobile device.
   */
  statusTap?: boolean;

  /**
   * Overrides the default icon in all `<wl-back-button>` components.
   */
  backButtonIcon?: string;

  /**
   * Overrides the default text in all `<wl-back-button>` components.
   */
  backButtonText?: string;

  /**
   * Overrides the default icon in all `<wl-menu-button>` components.
   */
  menuIcon?: string;

  /**
   * Overrides the default menu type for all `<wl-menu>` components.
   * By default the menu type is chosen based in the app's mode.
   */
  menuType?: string;

  /**
   * Overrides the default spinner in all `<wl-spinner>` components.
   * By default the spinner type is chosen based in the mode (ios or md).
   */
  spinner?: SpinerVariant;

  /**
   * Overrides the default spinner for all `wl-loading` overlays, ie. the ones
   * created with `wl-loading-controller`.
   */
  loadingSpinner?: SpinerVariant | null;

  /**
   * Overrides the default icon in all `<wl-refresh-content>` components.
   */
  refreshingIcon?: string;

  /**
   * Overrides the default spinner type in all `<wl-refresh-content>` components.
   */
  refreshingSpinner?: SpinerVariant | null;

  /**
   * Overrides the default spinner type in all `<wl-infinite-scroll-content>` components.
   */
  infiniteLoadingSpinner?: SpinerVariant | null;

  /**
   * Global switch that disables or enables "swipe-to-go-back" gesture across all
   * `wl-nav` in your application.
   */
  swipeBackEnabled?: boolean;

  /**
   * Overrides the default "animation" of all `wl-nav` and `wl-router-outlet` across the whole application.
   * This prop allows to replace the default transition and provide a custom one that applies to all navigation outlets.
   */
  navAnimation?: AnimationBuilder;

  /**
   * Provides a custom enter animation for all `wl-actwl-sheet`, overriding the default "animation".
   */
  actionSheetEnter?: AnimationBuilder;

  /**
   * Provides a custom enter animation for all `wl-alert`, overriding the default "animation".
   */
  alertEnter?: AnimationBuilder;

  /**
   * Provides a custom enter animation for all `wl-loading`, overriding the default "animation".
   */
  loadingEnter?: AnimationBuilder;

  /**
   * Provides a custom enter animation for all `wl-modal`, overriding the default "animation".
   */
  modalEnter?: AnimationBuilder;

  /**
   * Provides a custom enter animation for all `wl-popover`, overriding the default "animation".
   */
  popoverEnter?: AnimationBuilder;

  /**
   * Provides a custom enter animation for all `wl-toast`, overriding the default "animation".
   */
  toastEnter?: AnimationBuilder;

  /**
   * Provides a custom enter animation for all `wl-picker`, overriding the default "animation".
   */
  pickerEnter?: AnimationBuilder;

  /**
   * Provides a custom leave animation for all `wl-actwl-sheet`, overriding the default "animation".
   */
  actionSheetLeave?: AnimationBuilder;

  /**
   * Provides a custom leave animation for all `wl-alert`, overriding the default "animation".
   */
  alertLeave?: AnimationBuilder;

  /**
   * Provides a custom leave animation for all `wl-loading`, overriding the default "animation".
   */
  loadingLeave?: AnimationBuilder;

  /**
   * Provides a custom leave animation for all `wl-modal`, overriding the default "animation".
   */
  modalLeave?: AnimationBuilder;

  /**
   * Provides a custom leave animation for all `wl-popover`, overriding the default "animation".
   */
  popoverLeave?: AnimationBuilder;

  /**
   * Provides a custom leave animation for all `wl-toast`, overriding the default "animation".
   */
  toastLeave?: AnimationBuilder;

  /**
   * Provides a custom leave animation for all `wl-picker`, overriding the default "animation".
   */
  pickerLeave?: AnimationBuilder;

  /**
   * EXPERIMENTAL: Adds a page shadow to transitioning pages on iOS. Disabled by default.
   */
  experimentalTransitionShadow?: boolean;

  // PRIVATE configs
  keyboardHeight?: number;
  inputShims?: boolean;
  scrollPadding?: boolean;
  inputBlurring?: boolean;
  scrollAssist?: boolean;
  hideCaretOnScroll?: boolean;

  // INTERNAL configs
  persistConfig?: boolean;
  _forceStatusbarPadding?: boolean;
  _testing?: boolean;
  _zoneGate?: (h: () => any) => any;
}

export const setupConfig = (config: WlConfig) => {
  const win = window as any;
  const Wl = win.Wl;
  if (Wl && Wl.config && Wl.config.constructor.name !== "Object") {
    console.error("wl config was already initialized");
    return;
  }
  win.Wl = win.Wl || {};
  win.Wl.config = {
    ...win.Wl.config,
    ...config,
  };
  return win.Wl.config;
};

export const getMode = (): Mode => {
  const win = window as any;
  const config = win && win.Wl && win.Wl.config;
  if (config) {
    if (config.mode) {
      return config.mode;
    } else {
      return config.get("mode");
    }
  }
  return "md";
};
