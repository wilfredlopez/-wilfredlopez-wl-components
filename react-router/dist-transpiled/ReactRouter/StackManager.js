import React from 'react';
import { generateId, isDevMode } from '../utils';
import { RouteManagerContext, } from './RouteManagerContext';
import { View } from './View';
import { ViewTransitionManager } from './ViewTransitionManager';
class StackManagerInner extends React.Component {
    constructor(props) {
        super(props);
        this.routerOutletEl = React.createRef();
        this.id = this.props.id || generateId();
        this.handleViewSync = this.handleViewSync.bind(this);
        this.handleHideView = this.handleHideView.bind(this);
        this.state = {};
    }
    componentDidMount() {
        this.props.routeManager.setupWlRouter(this.id, this.props.children, this.routerOutletEl.current);
    }
    static getDerivedStateFromProps(props, state) {
        props.routeManager.syncRoute(props.children);
        return state;
    }
    componentWillUnmount() {
        this.props.routeManager.removeViewStack(this.id);
    }
    handleViewSync(page, viewId) {
        this.props.routeManager.syncView(page, viewId);
    }
    handleHideView(viewId) {
        this.props.routeManager.hideView(viewId);
    }
    renderChild(item, route) {
        const component = React.cloneElement(route, {
            computedMatch: item.routeData.match,
        });
        return component;
    }
    render() {
        const routeManager = this.props.routeManager;
        const viewStack = routeManager.viewStacks.get(this.id);
        const views = (viewStack || { views: [] }).views.filter(x => x.show);
        const wlRouterOutlet = React.Children.only(this.props.children);
        const childElements = views.map(view => {
            const route = routeManager.getRoute(view.routeId);
            return (React.createElement(ViewTransitionManager, { id: view.id, key: view.key, mount: view.mount },
                React.createElement(View, { onViewSync: this.handleViewSync, onHideView: this.handleHideView, view: view, route: route }, this.renderChild(view, route))));
        });
        const elementProps = {
            ref: this.routerOutletEl,
        };
        if (wlRouterOutlet.props.forwardedRef) {
            wlRouterOutlet.props.forwardedRef.current = this.routerOutletEl;
        }
        if (isDevMode()) {
            elementProps['data-stack-id'] = this.id;
        }
        const routerOutletChild = React.cloneElement(wlRouterOutlet, elementProps, childElements);
        return routerOutletChild;
    }
}
const withContext = (Component) => {
    return (props) => (React.createElement(RouteManagerContext.Consumer, null, context => React.createElement(Component, Object.assign({}, props, { routeManager: context }))));
};
export const StackManager = withContext(StackManagerInner);
//# sourceMappingURL=StackManager.js.map