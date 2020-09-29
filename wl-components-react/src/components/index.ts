import { defineCustomElements } from '@wilfredlopez/wl-components/loader';
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
// WL Animations
export { CreateAnimation } from './CreateAnimation';
export { RouterDirection } from './hrefprops';
// createControllerComponent
export { WlButton } from './WlButton';

defineCustomElements(window);
