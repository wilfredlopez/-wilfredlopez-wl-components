import { __rest } from "tslib";
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RouteManagerWithRouter } from './Router';
export class WlReactRouter extends React.Component {
    render() {
        const _a = this.props, { children } = _a, props = __rest(_a, ["children"]);
        return (React.createElement(BrowserRouter, Object.assign({}, props),
            React.createElement(RouteManagerWithRouter, null, children)));
    }
}
//# sourceMappingURL=WlReactRouter.js.map