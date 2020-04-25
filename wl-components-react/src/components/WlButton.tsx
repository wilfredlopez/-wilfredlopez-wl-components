import React from "react";

import { WlReactProps } from "./WlReactProps";

import { createForwardRef } from "./utils";
import { WlButtonInner } from "./inner-proxies";
import { Components as WlComponents } from "@wilfredlopez/wl-components";

interface WlButtonProps extends Partial<WlComponents.WlButton> {
  ariaLabel?: string;
  name?: string;
  // size?: "small" | "large";
}

type InternalProps = WlButtonProps & {
  forwardedRef?: React.RefObject<HTMLWlButtonElement>;
};

class WLIconContainer extends React.PureComponent<InternalProps> {
  constructor(props: InternalProps) {
    super(props);
  }

  render() {
    const { ...rest } = this.props;

    return (
      <WlButtonInner ref={this.props.forwardedRef} {...rest}>
        {this.props.children}
      </WlButtonInner>
    );
  }
}

export const WlButton = createForwardRef<
  WlButtonProps & WlReactProps,
  HTMLWlButtonElement
>(WLIconContainer, "WlButton");
