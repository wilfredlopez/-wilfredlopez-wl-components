import { NavContext } from "@wilfredlopez/react";
import React from "react";
import { StackManager } from "./StackManager";
export class NavManager extends React.Component {
    constructor(props) {
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
            },
        };
        this.listenUnregisterCallback = this.props.history.listen((location) => {
            this.setState({
                currentPath: location.pathname,
            });
        });
        if (document) {
            document.addEventListener("wlBackButton", (e) => {
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
    goBack(defaultHref) {
        this.props.onNavigateBack(defaultHref);
    }
    navigate(path, direction, wlRouteAction = "push") {
        this.props.onNavigate(wlRouteAction, path, direction);
    }
    getPageManager() {
        return (children) => children;
    }
    getStackManager() {
        return StackManager;
    }
    render() {
        return (React.createElement(NavContext.Provider, { value: this.state }, this.props.children));
    }
}
//# sourceMappingURL=NavManager.js.map