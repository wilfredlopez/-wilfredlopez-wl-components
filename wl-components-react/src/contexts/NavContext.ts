import { RouterDirection } from '../components/hrefprops';
import React from 'react';

export interface NavContextState {
  getPageManager: () => any;
  getStackManager: () => any;
  goBack: (defaultHref?: string) => void;
  navigate: (
    path: string,
    direction?: RouterDirection | 'none',
    wlRouteAction?: 'push' | 'replace' | 'pop'
  ) => void;
  hasWlRouter: () => boolean;
  registerWlPage: (page: HTMLElement) => void;
  currentPath: string | undefined;
}

export const NavContext = /*@__PURE__*/ React.createContext<NavContextState>({
  getPageManager: () => undefined,
  getStackManager: () => undefined,
  goBack: (defaultHref?: string) => {
    if (defaultHref !== undefined) {
      window.location.pathname = defaultHref;
    } else {
      window.history.back();
    }
  },
  navigate: (path: string) => {
    window.location.pathname = path;
  },
  hasWlRouter: () => false,
  registerWlPage: () => undefined,
  currentPath: undefined,
});
