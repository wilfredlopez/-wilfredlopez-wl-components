import React from 'react';
import ReactDom from 'react-dom';

import {
  attachProps,
  createForwardRef,
  dashToPascalCase,
  isCoveredByReact,
} from './utils';
import { RouterDirection } from './hrefprops';
import { NavContext } from '../contexts/NavContext';

interface WlReactInternalProps<ElementType>
  extends React.HTMLAttributes<ElementType> {
  forwardedRef?: React.Ref<ElementType>;
  href?: string;
  ref?: React.Ref<any>;
  // translate?: 'yes' | 'no' | undefined;
  routerLink?: string;
  routerDirection?: RouterDirection;
}

export const createReactComponent = <PropType, ElementType>(
  tagName: string,
  routerLinkComponent = false
) => {
  const displayName = dashToPascalCase(tagName);
  const ReactComponent = class extends React.Component<
    WlReactInternalProps<PropType>
  > {
    context!: React.ContextType<typeof NavContext>;
    constructor(props: WlReactInternalProps<PropType>) {
      super(props);
    }

    componentDidMount() {
      this.componentDidUpdate(this.props);
    }

    componentDidUpdate(prevProps: WlReactInternalProps<PropType>) {
      const node = ReactDom.findDOMNode(this) as HTMLElement;
      attachProps(node, this.props, prevProps);
    }

    private handleClick = (e: React.MouseEvent<PropType>) => {
      const { routerLink, routerDirection } = this.props;
      if (routerLink !== undefined) {
        e.preventDefault();
        // Not Sure If this is going to work.
        this.context.navigate(routerLink, routerDirection);
      }
      // tslint:disable-next-line: semicolon
    };

    render() {
      const {
        children,
        forwardedRef,
        style,
        className,
        // translate,
        ref,
        ...cProps
      } = this.props;

      const propsToPass = Object.keys(cProps).reduce((acc, name) => {
        if (name.indexOf('on') === 0 && name[2] === name[2].toUpperCase()) {
          const eventName = name.substring(2).toLowerCase();
          if (isCoveredByReact(eventName)) {
            (acc as any)[name] = (cProps as any)[name];
          }
        }
        return acc;
      }, {});

      const newProps: WlReactInternalProps<PropType> = {
        ...propsToPass,
        ref: forwardedRef,
        style,
      };

      if (routerLinkComponent) {
        if (this.props.routerLink && !this.props.href) {
          newProps.href = this.props.routerLink;
        }
        if (newProps.onClick) {
          const oldClick = newProps.onClick;
          newProps.onClick = (e: React.MouseEvent<PropType>) => {
            oldClick(e);
            if (!e.defaultPrevented) {
              this.handleClick(e);
            }
          };
        } else {
          newProps.onClick = this.handleClick;
        }
      }

      return React.createElement(tagName, newProps, children);
    }

    static get displayName() {
      return displayName;
    }
    static get contextType() {
      return NavContext;
    }
  };
  return createForwardRef<PropType, ElementType>(ReactComponent, displayName);
};
