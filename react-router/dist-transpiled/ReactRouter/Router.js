import React from "react";
import { matchPath, withRouter } from "react-router-dom";
import { generateId, isDevMode } from "../utils";
import { LocationHistory } from "../utils/LocationHistory";
import { NavManager } from "./NavManager";
import { RouteManagerContext, } from "./RouteManagerContext";
import { ViewStacks } from "./ViewStacks";
export class RouteManager extends React.Component {
    constructor(props) {
        super(props);
        this.locationHistory = new LocationHistory();
        this.routes = {};
        this.wlPageElements = {};
        this.routerOutlets = {};
        this.firstRender = true;
        this.listenUnregisterCallback = this.props.history.listen(this.historyChange.bind(this));
        this.handleNavigate = this.handleNavigate.bind(this);
        this.navigateBack = this.navigateBack.bind(this);
        this.state = {
            viewStacks: new ViewStacks(),
            hideView: this.hideView.bind(this),
            setupWlRouter: this.setupWlRouter.bind(this),
            removeViewStack: this.removeViewStack.bind(this),
            syncView: this.syncView.bind(this),
            syncRoute: this.syncRoute.bind(this),
            getRoute: this.getRoute.bind(this),
        };
        this.locationHistory.add({
            hash: window.location.hash,
            key: generateId(),
            pathname: window.location.pathname,
            search: window.location.search,
            state: {},
        });
    }
    componentDidUpdate(_prevProps, prevState) {
        // Trigger a page change if the location or action is different
        if ((this.state.location && prevState.location !== this.state.location) ||
            prevState.action !== this.state.action) {
            const viewStacks = Object.assign(new ViewStacks(), this.state.viewStacks);
            this.setActiveView(this.state.location, this.state.action, viewStacks);
        }
    }
    componentWillUnmount() {
        if (this.listenUnregisterCallback) {
            this.listenUnregisterCallback();
        }
    }
    getRoute(id) {
        return this.routes[id];
    }
    hideView(viewId) {
        const viewStacks = Object.assign(new ViewStacks(), this.state.viewStacks);
        const { view } = viewStacks.findViewInfoById(viewId);
        if (view) {
            view.show = false;
            view.isWlRoute = false;
            view.prevId = undefined;
            view.key = generateId();
            delete this.wlPageElements[view.id];
            this.setState({
                viewStacks,
            });
        }
    }
    historyChange(location, action) {
        const wlRouteAction = this.currentWlRouteAction === "pop"
            ? "pop"
            : action.toLowerCase();
        let direction = this.currentRouteDirection;
        if (wlRouteAction === "push") {
            this.locationHistory.add(location);
        }
        else if (wlRouteAction === "pop") {
            this.locationHistory.pop();
            direction = direction || "back";
        }
        else if (wlRouteAction === "replace") {
            this.locationHistory.replace(location);
            direction = "none";
        }
        if (direction === "root") {
            this.locationHistory.clear();
            this.locationHistory.add(location);
        }
        location.state = location.state || { direction };
        this.setState({
            location,
            action: wlRouteAction,
        });
        this.currentRouteDirection = undefined;
        this.currentWlRouteAction = undefined;
    }
    setActiveView(location, action, viewStacks) {
        let direction = (location.state && location.state.direction) || "forward";
        let leavingView;
        const viewStackKeys = viewStacks.getKeys();
        let shouldTransitionPage = false;
        let leavingViewHtml;
        viewStackKeys.forEach((key) => {
            const { view: enteringView, viewStack: enteringViewStack, match, } = viewStacks.findViewInfoByLocation(location, key);
            if (!enteringView || !enteringViewStack) {
                return;
            }
            leavingView = viewStacks.findViewInfoById(this.activeWlPageId).view;
            if (enteringView.isWlRoute) {
                enteringView.show = true;
                enteringView.mount = true;
                enteringView.routeData.match = match;
                shouldTransitionPage = true;
                this.activeWlPageId = enteringView.id;
                if (leavingView) {
                    if (action === "push" && direction === "forward") {
                        /**
                         * If the page is being pushed into the stack by another view,
                         * record the view that originally directed to the new view for back button purposes.
                         */
                        enteringView.prevId = leavingView.id;
                    }
                    else if (direction !== "none") {
                        leavingView.mount = false;
                        this.removeOrphanedViews(enteringView, enteringViewStack);
                    }
                    leavingViewHtml =
                        enteringView.id === leavingView.id
                            ? this.wlPageElements[leavingView.id].outerHTML
                            : undefined;
                }
                else {
                    // If there is not a leavingView, then we shouldn't provide a direction
                    direction = undefined;
                }
            }
            else {
                enteringView.show = true;
                enteringView.mount = true;
                enteringView.routeData.match = match;
            }
        });
        if (leavingView) {
            if (!leavingView.isWlRoute) {
                leavingView.mount = false;
                leavingView.show = false;
            }
        }
        this.setState({
            viewStacks,
        }, () => {
            if (shouldTransitionPage) {
                const { view: enteringView, viewStack, } = this.state.viewStacks.findViewInfoById(this.activeWlPageId);
                if (enteringView && viewStack) {
                    const enteringEl = this.wlPageElements[enteringView.id];
                    const leavingEl = leavingView && this.wlPageElements[leavingView.id];
                    if (enteringEl) {
                        let navDirection;
                        if (leavingEl && leavingEl.innerHTML === "") {
                            // Don't animate from an empty view
                            navDirection = undefined;
                        }
                        else if (direction === "none" || direction === "root") {
                            navDirection = undefined;
                        }
                        else {
                            navDirection = direction;
                        }
                        const shouldGoBack = !!enteringView.prevId;
                        const routerOutlet = this.routerOutlets[viewStack.id];
                        this.commitView(enteringEl, leavingEl, routerOutlet, navDirection, shouldGoBack, leavingViewHtml);
                    }
                    else if (leavingEl) {
                        leavingEl.classList.add("wl-page-hidden");
                        leavingEl.setAttribute("aria-hidden", "true");
                    }
                }
                // Warn if an wl-page was not eventually rendered in Dev Mode
                if (isDevMode()) {
                    if (enteringView &&
                        enteringView.routeData.match.url !== location.pathname) {
                        setTimeout(() => {
                            const { view } = this.state.viewStacks.findViewInfoById(this.activeWlPageId);
                            if (view.routeData.match.url !== location.pathname) {
                                console.warn("No WlPage was found to render. Make sure you wrap your page with an WlPage component.");
                            }
                        }, 100);
                    }
                }
            }
        });
    }
    removeOrphanedViews(view, viewStack) {
        // Note: This technique is a bit wonky for views that reference each other and get into a circular loop.
        // It can still remove a view that probably shouldn't be.
        const viewsToRemove = viewStack.views.filter((v) => v.prevId === view.id);
        viewsToRemove.forEach((v) => {
            // Don't remove if view is currently active
            if (v.id !== this.activeWlPageId) {
                this.removeOrphanedViews(v, viewStack);
                // If view is not currently visible, go ahead and remove it from DOM
                const page = this.wlPageElements[v.id];
                if (page.classList.contains("wl-page-hidden")) {
                    v.show = false;
                    v.isWlRoute = false;
                    v.prevId = undefined;
                    v.key = generateId();
                    delete this.wlPageElements[v.id];
                }
                v.mount = false;
            }
        });
    }
    setupWlRouter(id, children, routerOutlet) {
        const views = [];
        let activeId;
        const wlRouterOutlet = React.Children.only(children);
        let foundMatch = false;
        React.Children.forEach(wlRouterOutlet.props.children, (child) => {
            const routeId = generateId();
            this.routes[routeId] = child;
            views.push(createViewItem(child, routeId, this.props.history.location));
        });
        if (!foundMatch) {
            const notFoundRoute = views.find((r) => {
                // try to find a route that doesn't have a path or from prop, that will be our not found route
                return !r.routeData.childProps.path && !r.routeData.childProps.from;
            });
            if (notFoundRoute) {
                notFoundRoute.show = true;
            }
        }
        this.registerViewStack(id, activeId, views, routerOutlet, this.props.location);
        function createViewItem(child, routeId, location) {
            const viewId = generateId();
            const key = generateId();
            // const route = child;
            const matchProps = {
                exact: child.props.exact,
                path: child.props.path || child.props.from,
                component: child.props.component,
            };
            const match = matchPath(location.pathname, matchProps);
            const view = {
                id: viewId,
                key,
                routeData: {
                    match,
                    childProps: child.props,
                },
                routeId,
                mount: true,
                show: !!match,
                isWlRoute: false,
            };
            if (match && view.isWlRoute) {
                activeId = viewId;
            }
            if (!foundMatch && match) {
                foundMatch = true;
            }
            return view;
        }
    }
    registerViewStack(stack, activeId, stackItems, routerOutlet, _location) {
        this.setState((prevState) => {
            const prevViewStacks = Object.assign(new ViewStacks(), prevState.viewStacks);
            const newStack = {
                id: stack,
                views: stackItems,
            };
            this.routerOutlets[stack] = routerOutlet;
            if (activeId) {
                this.activeWlPageId = activeId;
            }
            prevViewStacks.set(stack, newStack);
            return {
                viewStacks: prevViewStacks,
            };
        }, () => {
            this.setupRouterOutlet(routerOutlet);
        });
    }
    async setupRouterOutlet(routerOutlet) {
        const canStart = () => {
            const swipeEnabled = false;
            if (swipeEnabled) {
                const { view } = this.state.viewStacks.findViewInfoById(this.activeWlPageId);
                return !!(view && view.prevId);
            }
            else {
                return false;
            }
        };
        const onStart = () => {
            this.navigateBack();
        };
        routerOutlet.swipeHandler = {
            canStart,
            onStart,
            onEnd: (_shouldContinue) => true,
        };
    }
    removeViewStack(stack) {
        const viewStacks = Object.assign(new ViewStacks(), this.state.viewStacks);
        viewStacks.delete(stack);
        this.setState({
            viewStacks,
        });
    }
    syncView(page, viewId) {
        const viewStacks = Object.assign(new ViewStacks(), this.state.viewStacks);
        const { view } = viewStacks.findViewInfoById(viewId);
        if (view) {
            view.isWlRoute = true;
            this.wlPageElements[view.id] = page;
            this.setActiveView(this.state.location || this.props.location, this.state.action, viewStacks);
        }
    }
    syncRoute(routerOutlet) {
        const wlRouterOutlet = React.Children.only(routerOutlet);
        React.Children.forEach(wlRouterOutlet.props.children, (child) => {
            for (const routeKey in this.routes) {
                const route = this.routes[routeKey];
                if ((route.props.path || route.props.from) ===
                    (child.props.path || child.props.from) &&
                    route.props.exact === child.props.exact &&
                    route.props.to === child.props.to) {
                    this.routes[routeKey] = child;
                }
            }
        });
    }
    async commitView(enteringEl, leavingEl, wlRouterOutlet, direction, showGoBack, leavingViewHtml) {
        if (!this.firstRender) {
            if (!("componentOnReady" in wlRouterOutlet)) {
                await waitUntilRouterOutletReady(wlRouterOutlet);
            }
            if (enteringEl === leavingEl && direction && leavingViewHtml) {
                // If a page is transitioning to another version of itself
                // we clone it so we can have an animation to show
                const newLeavingElement = clonePageElement(leavingViewHtml);
                wlRouterOutlet.appendChild(newLeavingElement);
                await wlRouterOutlet.commit(enteringEl, newLeavingElement, {
                    deepWait: true,
                    duration: direction === undefined ? 0 : undefined,
                    direction,
                    showGoBack,
                    progressAnimation: false,
                });
                wlRouterOutlet.removeChild(newLeavingElement);
            }
            else {
                await wlRouterOutlet.commit(enteringEl, leavingEl, {
                    deepWait: true,
                    duration: direction === undefined ? 0 : undefined,
                    direction,
                    showGoBack,
                    progressAnimation: false,
                });
            }
            if (leavingEl && enteringEl !== leavingEl) {
                /** add hidden attributes */
                leavingEl.classList.add("wl-page-hidden");
                leavingEl.setAttribute("aria-hidden", "true");
            }
        }
        else {
            enteringEl.classList.remove("wl-page-invisible");
            enteringEl.style.zIndex = "101";
            enteringEl.dispatchEvent(new Event("wlViewWillEnter"));
            enteringEl.dispatchEvent(new Event("wlViewDidEnter"));
            this.firstRender = false;
        }
    }
    handleNavigate(wlRouteAction, path, direction) {
        this.currentWlRouteAction = wlRouteAction;
        switch (wlRouteAction) {
            case "push":
                this.currentRouteDirection = direction;
                this.props.history.push(path);
                break;
            case "pop":
                this.currentRouteDirection = direction || "back";
                this.props.history.replace(path);
                break;
            case "replace":
                this.currentRouteDirection = "none";
                this.props.history.replace(path);
                break;
        }
    }
    navigateBack(defaultHref) {
        const { view: leavingView } = this.state.viewStacks.findViewInfoById(this.activeWlPageId);
        if (leavingView) {
            if (leavingView.id === leavingView.prevId) {
                const previousLocation = this.locationHistory.previous();
                if (previousLocation) {
                    this.handleNavigate("pop", previousLocation.pathname + previousLocation.search);
                }
                else {
                    defaultHref && this.handleNavigate("pop", defaultHref);
                }
            }
            else {
                const { view: enteringView } = this.state.viewStacks.findViewInfoById(leavingView.prevId);
                if (enteringView) {
                    const lastLocation = this.locationHistory.findLastLocationByUrl(enteringView.routeData.match.url);
                    if (lastLocation) {
                        this.handleNavigate("pop", lastLocation.pathname + lastLocation.search);
                    }
                    else {
                        this.handleNavigate("pop", enteringView.routeData.match.url);
                    }
                }
                else {
                    const currentLocation = this.locationHistory.previous();
                    if (currentLocation) {
                        this.handleNavigate("pop", currentLocation.pathname + currentLocation.search);
                    }
                    else {
                        if (defaultHref) {
                            this.handleNavigate("pop", defaultHref);
                        }
                    }
                }
            }
        }
        else {
            if (defaultHref) {
                this.handleNavigate("replace", defaultHref, "back");
            }
        }
    }
    render() {
        return (React.createElement(RouteManagerContext.Provider, { value: this.state },
            React.createElement(NavManager, Object.assign({}, this.props, { onNavigateBack: this.navigateBack, onNavigate: this.handleNavigate }), this.props.children)));
    }
}
function clonePageElement(leavingViewHtml) {
    const newEl = document.createElement("div");
    newEl.innerHTML = leavingViewHtml;
    newEl.classList.add("wl-page-hidden");
    newEl.style.zIndex = "";
    // Remove an existing back button so the new element doesn't get two of them
    const wlBackButton = newEl.getElementsByTagName("wl-back-button");
    if (wlBackButton[0]) {
        wlBackButton[0].innerHTML = "";
    }
    return newEl.firstChild;
}
async function waitUntilRouterOutletReady(wlRouterOutlet) {
    if ("componentOnReady" in wlRouterOutlet) {
        return;
    }
    else {
        setTimeout(() => {
            waitUntilRouterOutletReady(wlRouterOutlet);
        }, 0);
    }
}
export const RouteManagerWithRouter = withRouter(RouteManager);
RouteManagerWithRouter.displayName = "RouteManager";
//# sourceMappingURL=Router.js.map