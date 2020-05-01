import React from "react";
import { ViewStacks } from "./ViewStacks";
export const RouteManagerContext = /*@__PURE__*/ React.createContext({
    viewStacks: new ViewStacks(),
    syncView: () => {
        navContextNotFoundError();
    },
    syncRoute: () => {
        navContextNotFoundError();
    },
    hideView: () => {
        navContextNotFoundError();
    },
    setupWlRouter: () => Promise.reject(navContextNotFoundError()),
    removeViewStack: () => {
        navContextNotFoundError();
    },
    getRoute: () => {
        navContextNotFoundError();
    },
});
function navContextNotFoundError() {
    console.error("WlReactRouter not found, did you add it to the app?");
}
//# sourceMappingURL=RouteManagerContext.js.map