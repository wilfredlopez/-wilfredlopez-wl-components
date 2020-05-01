import React from "react";

import { WlReactProps } from "../WlReactProps";

export type WlReactExternalProps<PropType, ElementType> = PropType &
  Omit<React.HTMLAttributes<ElementType>, "style"> &
  WlReactProps;

export const createForwardRef = <PropType, ElementType>(
  ReactComponent: any,
  displayName: string
) => {
  const forwardRef = (
    props: WlReactExternalProps<PropType, ElementType>,
    ref: React.Ref<ElementType>
  ) => {
    return <ReactComponent {...props} forwardedRef={ref} />;
  };
  forwardRef.displayName = displayName;

  return React.forwardRef(forwardRef);
};

interface WLTestCoreConfig {}

export const getConfig = (): WLTestCoreConfig | null => {
  if (typeof (window as any) !== "undefined") {
    const Wl = (window as any).Wl;
    if (Wl && Wl.config) {
      return Wl.config;
    }
  }
  return null;
};

export * from "./attachProps";
export * from "./case";
