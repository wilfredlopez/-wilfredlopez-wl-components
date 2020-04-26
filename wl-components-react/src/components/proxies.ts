import { JSX } from "@wilfredlopez/wl-components";

import { /*@__PURE__*/ createReactComponent } from "./createComponent";

//wl-button
export const WlContainer = /*@__PURE__*/ createReactComponent<
  JSX.WlContainer,
  HTMLWlContainerElement
>("wl-container");

export const WlCol = /*@__PURE__*/ createReactComponent<
  JSX.WlCol,
  HTMLWlColElement
>("wl-col");

export const WlGrid = /*@__PURE__*/ createReactComponent<
  JSX.WlGrid,
  HTMLWlGridElement
>("wl-grid");

export const WlModal = /*@__PURE__*/ createReactComponent<
  JSX.WlModal,
  HTMLWlModalElement
>("wl-grid");

export const WlRow = /*@__PURE__*/ createReactComponent<
  JSX.WlRow,
  HTMLWlRowElement
>("wl-row");

//wl-appbar
export const WlAppbar = /*@__PURE__*/ createReactComponent<
  JSX.WlAppbar,
  HTMLWlAppbarElement
>("wl-appbar");

export const WlCard = /*@__PURE__*/ createReactComponent<
  JSX.WlCard,
  HTMLWlCardElement
>("wl-card");

export const WlSpinner = /*@__PURE__*/ createReactComponent<
  JSX.WlSpinner,
  HTMLWlSpinnerElement
>("wl-spinner");
