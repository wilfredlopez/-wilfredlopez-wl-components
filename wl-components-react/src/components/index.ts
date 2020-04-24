import { defineCustomElements } from "@wilfredlopez/wl-components/loader";

export * from "./proxies";

// createControllerComponent
export { WlButton } from "./WlButton";

// TODO: defineCustomElements() is asyncronous
// We need to use the promise
defineCustomElements(window);
