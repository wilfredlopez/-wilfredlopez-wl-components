import { defineCustomElements } from '@wilfredlopez/wl-components/loader';
// export {
//   Gesture,
//   GestureConfig,
//   GestureDetail,
//   createGesture,
//   createAnimation,
//   mdTransitionAnimation,
//   iosTransitionAnimation,
//   setupConfig,
// } from '@wilfredlopez/wl-components/dist/types/interfaces';
export {
  Gesture,
  GestureConfig,
  GestureDetail,
  createGesture,
  createAnimation,
  mdTransitionAnimation,
  iosTransitionAnimation,
  setupConfig,
} from '@wilfredlopez/wl-components';

export * from './proxies';
export { WlPage } from './WlPage';
export { WlRouterOutlet } from './WlRouterOutlet';
// Utils
export { isPlatform, getPlatforms, getConfig } from './utils';
// Ionic Animations
export { CreateAnimation } from './CreateAnimation';
export { RouterDirection } from './hrefprops';
// createControllerComponent
export { WlButton } from './WlButton';

// TODO: defineCustomElements() is asyncronous
// We need to use the promise
defineCustomElements(window);
