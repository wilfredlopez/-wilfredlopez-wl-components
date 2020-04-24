import { defineCustomElements } from "@wilfredlopez/wl-components/loader";

export * from "./proxies";

// createControllerComponent
export { WlButton } from "./WlButton";

// Ionic Animations
export { CreateAnimation } from "./CreateAnimation";

// TODO: defineCustomElements() is asyncronous
// We need to use the promise
defineCustomElements(window);
