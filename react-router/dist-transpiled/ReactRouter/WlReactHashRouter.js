import { __rest } from "tslib";
import React from "react";
import { HashRouter } from "react-router-dom";
import { RouteManagerWithRouter } from "./Router";
export class WlReactHashRouter extends React.Component {
    render() {
        const _a = this.props, { children } = _a, props = __rest(_a, ["children"]);
        return (React.createElement(HashRouter, Object.assign({}, props),
            React.createElement(RouteManagerWithRouter, null, children)));
    }
}
//# sourceMappingURL=WlReactHashRouter.js.map