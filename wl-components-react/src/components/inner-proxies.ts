import { JSX } from "@wilfredlopez/wl-components";

import { /*@__PURE__*/ createReactComponent } from "./createComponent";

//wl-button
export const WlButtonInner = /*@__PURE__*/ createReactComponent<
  JSX.WlButton,
  HTMLWlButtonElement
>("wl-button", true);
