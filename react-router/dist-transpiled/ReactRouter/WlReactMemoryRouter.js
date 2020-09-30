import { __rest } from "tslib";
import React from 'react';
import { MemoryRouter, matchPath } from 'react-router';
import { RouteManager } from './Router';
export class WlReactMemoryRouter extends React.Component {
    render() {
        const _a = this.props, { children, history } = _a, props = __rest(_a, ["children", "history"]);
        const match = matchPath(history.location.pathname, this.props);
        return (React.createElement(MemoryRouter, Object.assign({}, props),
            React.createElement(RouteManager, { history: history, location: history.location, match: match }, children)));
    }
}
//# sourceMappingURL=WlReactMemoryRouter.js.map