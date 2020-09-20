import { JSX as LocalJSX } from '@wilfredlopez/wl-components';
import React from 'react';

import { NavContext } from '../contexts/NavContext';

import { WlReactProps } from './WlReactProps';
import { WlRouterOutletInner } from './inner-proxies';
import { createForwardRef } from './utils';

type Props = LocalJSX.WlRouterOutlet & {
  ref?: React.RefObject<any>;
};

type InternalProps = Props & {
  forwardedRef?: React.RefObject<HTMLWlRouterOutletElement>;
};

const WlRouterOutletContainer = /*@__PURE__*/ (() =>
  class extends React.Component<InternalProps> {
    context!: React.ContextType<typeof NavContext>;

    render() {
      const StackManager = this.context.getStackManager();

      return this.context.hasWlRouter() ? (
        <StackManager>
          <WlRouterOutletInner ref={this.props.forwardedRef} {...this.props}>
            {this.props.children}
          </WlRouterOutletInner>
        </StackManager>
      ) : (
        <WlRouterOutletInner ref={this.props.forwardedRef} {...this.props}>
          {this.props.children}
        </WlRouterOutletInner>
      );
    }

    static get contextType() {
      return NavContext;
    }
  })();

export const WlRouterOutlet = createForwardRef<
  Props & WlReactProps,
  HTMLWlRouterOutletElement
>(WlRouterOutletContainer, 'WlRouterOutlet');
