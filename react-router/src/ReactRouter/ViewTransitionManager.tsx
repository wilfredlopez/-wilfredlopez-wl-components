import {
  DefaultWlLifeCycleContext,
  WlLifeCycleContext,
} from "@wilfredlopez/react";
import React from "react";

import { RouteManagerContext } from "./RouteManagerContext";

interface ViewTransitionManagerProps {
  id: string;
  mount: boolean;
}

interface ViewTransitionManagerState {
  show: boolean;
}

/**
 * Manages the View's DOM lifetime by keeping it around long enough to complete page transitions before removing it.
 */
export class ViewTransitionManager extends React.Component<
  ViewTransitionManagerProps,
  ViewTransitionManagerState
> {
  WlLifeCycleContext = new DefaultWlLifeCycleContext();
  _isMounted = false;
  context!: React.ContextType<typeof RouteManagerContext>;

  constructor(props: ViewTransitionManagerProps) {
    super(props);
    this.state = {
      show: true,
    };

    this.WlLifeCycleContext.onComponentCanBeDestroyed(() => {
      if (!this.props.mount) {
        if (this._isMounted) {
          this.setState(
            {
              show: false,
            },
            () => {
              this.context.hideView(this.props.id);
            }
          );
        }
      }
    });
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { show } = this.state;
    return (
      <WlLifeCycleContext.Provider value={this.WlLifeCycleContext}>
        {show && this.props.children}
      </WlLifeCycleContext.Provider>
    );
  }

  static get contextType() {
    return RouteManagerContext;
  }
}
