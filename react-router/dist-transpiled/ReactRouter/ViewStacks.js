import { matchPath } from 'react-router-dom';
/**
 * The holistic view of all the Routes configured for an application inside of an WLRouterOutlet.
 */
export class ViewStacks {
    constructor() {
        this.viewStacks = {};
    }
    get(key) {
        return this.viewStacks[key];
    }
    set(key, viewStack) {
        this.viewStacks[key] = viewStack;
    }
    getKeys() {
        return Object.keys(this.viewStacks);
    }
    delete(key) {
        delete this.viewStacks[key];
    }
    findViewInfoByLocation(location, viewKey) {
        let view;
        let match;
        let viewStack;
        viewStack = this.viewStacks[viewKey];
        if (viewStack) {
            viewStack.views.some(matchView);
            if (!view) {
                viewStack.views.some(r => {
                    // try to find a route that doesn't have a path or from prop, that will be our not found route
                    if (!r.routeData.childProps.path && !r.routeData.childProps.from) {
                        match = {
                            path: location.pathname,
                            url: location.pathname,
                            isExact: true,
                            params: {},
                        };
                        view = r;
                        return true;
                    }
                    return false;
                });
            }
        }
        return { view, viewStack, match };
        function matchView(v) {
            const matchProps = {
                exact: v.routeData.childProps.exact,
                path: v.routeData.childProps.path || v.routeData.childProps.from,
                component: v.routeData.childProps.component,
            };
            const myMatch = matchPath(location.pathname, matchProps);
            if (myMatch) {
                view = v;
                match = myMatch;
                return true;
            }
            return false;
        }
    }
    findViewInfoById(id = '') {
        let view;
        let viewStack;
        const keys = this.getKeys();
        keys.some(key => {
            const vs = this.viewStacks[key];
            view = vs.views.find(x => x.id === id);
            if (view) {
                viewStack = vs;
                return true;
            }
            else {
                return false;
            }
        });
        return { view, viewStack };
    }
}
//# sourceMappingURL=ViewStacks.js.map