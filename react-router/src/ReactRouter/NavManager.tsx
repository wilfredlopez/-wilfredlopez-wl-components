import { RouterDirection } from "@wilfredlopez/wl-components/dist/types/interfaces/RouterDirection";

import { NavContext, NavContextState } from "@wilfredlopez/react";
import { Location as HistoryLocation, UnregisterCallback } from "history";
import React from "react";
import { RouteComponentProps } from "react-router-dom";

import { WlRouteAction } from "./wlRouteAction";
import { StackManager } from "./StackManager";

interface NavManagerProps extends RouteComponentProps {
  onNavigateBack: (defaultHref?: string) => void;
  onNavigate: (WlRouteAction: WlRouteAction, path: string, state?: any) => void;
}

export class NavManager extends React.Component<
  NavManagerProps,
  NavContextState
> {
  listenUnregisterCallback: UnregisterCallback | undefined;

  constructor(props: NavManagerProps) {
    super(props);
    this.state = {
      goBack: this.goBack.bind(this),
      hasWlRouter: () => true,
      navigate: this.navigate.bind(this),
      getStackManager: this.getStackManager.bind(this),
      getPageManager: this.getPageManager.bind(this),
      currentPath: this.props.location.pathname,
      registerWlPage: () => {
        return;
      }, // overridden in View for each WlPage
    };

    this.listenUnregisterCallback = this.props.history.listen(
      (location: HistoryLocation) => {
        this.setState({
          currentPath: location.pathname,
        });
      }
    );

    if (document) {
      document.addEventListener("wlBackButton", (e: any) => {
        e.detail.register(0, () => {
          this.props.history.goBack();
        });
      });
    }
  }

  componentWillUnmount() {
    if (this.listenUnregisterCallback) {
      this.listenUnregisterCallback();
    }
  }

  goBack(defaultHref?: string) {
    this.props.onNavigateBack(defaultHref);
  }

  navigate(
    path: string,
    direction?: RouterDirection | "none",
    wlRouteAction: WlRouteAction = "push"
  ) {
    this.props.onNavigate(wlRouteAction, path, direction);
  }

  getPageManager() {
    return (children: any) => children;
  }

  getStackManager() {
    return StackManager;
  }

  render() {
    return (
      <NavContext.Provider value={this.state}>
        {this.props.children}
      </NavContext.Provider>
    );
  }
}
