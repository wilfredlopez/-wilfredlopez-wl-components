import React from 'react';

import { NavContext } from '../contexts/NavContext';

import { WlReactProps } from './WlReactProps';
import { createForwardRef } from './utils';

interface WlPageProps extends WlReactProps {}

interface WlPageInternalProps extends WlPageProps {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

class WlPageInternal extends React.Component<WlPageInternalProps> {
  context!: React.ContextType<typeof NavContext>;
  ref: React.RefObject<HTMLDivElement>;

  constructor(props: WlPageInternalProps) {
    super(props);
    this.ref = this.props.forwardedRef || React.createRef();
  }

  componentDidMount() {
    if (this.context && this.ref && this.ref.current) {
      if (this.context.hasWlRouter()) {
        this.context.registerWlPage(this.ref.current);
      }
    }
  }

  render() {
    const { className, children, forwardedRef, ...props } = this.props;

    return (
      <div
        className={className ? `wl-page ${className}` : 'wl-page'}
        ref={this.ref}
        {...props}
      >
        {children}
      </div>
    );
  }

  static get displayName() {
    return 'WlPage';
  }

  static get contextType() {
    return NavContext;
  }
}

export const WlPage = createForwardRef(WlPageInternal, 'WlPage');
