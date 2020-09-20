import React from 'react';

export interface WlLifeCycleContextInterface {
  onWlViewWillEnter: (callback: () => void) => void;
  wlViewWillEnter: () => void;
  onWlViewDidEnter: (callback: () => void) => void;
  wlViewDidEnter: () => void;
  onWlViewWillLeave: (callback: () => void) => void;
  wlViewWillLeave: () => void;
  onWlViewDidLeave: (callback: () => void) => void;
  wlViewDidLeave: () => void;
}

export const WlLifeCycleContext = /*@__PURE__*/ React.createContext<
  WlLifeCycleContextInterface
>({
  onWlViewWillEnter: () => {
    return;
  },
  wlViewWillEnter: () => {
    return;
  },
  onWlViewDidEnter: () => {
    return;
  },
  wlViewDidEnter: () => {
    return;
  },
  onWlViewWillLeave: () => {
    return;
  },
  wlViewWillLeave: () => {
    return;
  },
  onWlViewDidLeave: () => {
    return;
  },
  wlViewDidLeave: () => {
    return;
  },
});

export interface LifeCycleCallback {
  (): void;
  id?: number;
}

export const DefaultWlLifeCycleContext = class
  implements WlLifeCycleContextInterface {
  wlViewWillEnterCallbacks: LifeCycleCallback[] = [];
  wlViewDidEnterCallbacks: LifeCycleCallback[] = [];
  wlViewWillLeaveCallbacks: LifeCycleCallback[] = [];
  wlViewDidLeaveCallbacks: LifeCycleCallback[] = [];
  componentCanBeDestroyedCallback?: () => void;

  onWlViewWillEnter(callback: LifeCycleCallback) {
    if (callback.id) {
      const index = this.wlViewWillEnterCallbacks.findIndex(
        x => x.id === callback.id
      );
      if (index > -1) {
        this.wlViewWillEnterCallbacks[index] = callback;
      } else {
        this.wlViewWillEnterCallbacks.push(callback);
      }
    } else {
      this.wlViewWillEnterCallbacks.push(callback);
    }
  }

  wlViewWillEnter() {
    this.wlViewWillEnterCallbacks.forEach(cb => cb());
  }

  onWlViewDidEnter(callback: LifeCycleCallback) {
    if (callback.id) {
      const index = this.wlViewDidEnterCallbacks.findIndex(
        x => x.id === callback.id
      );
      if (index > -1) {
        this.wlViewDidEnterCallbacks[index] = callback;
      } else {
        this.wlViewDidEnterCallbacks.push(callback);
      }
    } else {
      this.wlViewDidEnterCallbacks.push(callback);
    }
  }

  wlViewDidEnter() {
    this.wlViewDidEnterCallbacks.forEach(cb => cb());
  }

  onWlViewWillLeave(callback: LifeCycleCallback) {
    if (callback.id) {
      const index = this.wlViewWillLeaveCallbacks.findIndex(
        x => x.id === callback.id
      );
      if (index > -1) {
        this.wlViewWillLeaveCallbacks[index] = callback;
      } else {
        this.wlViewWillLeaveCallbacks.push(callback);
      }
    } else {
      this.wlViewWillLeaveCallbacks.push(callback);
    }
  }

  wlViewWillLeave() {
    this.wlViewWillLeaveCallbacks.forEach(cb => cb());
  }

  onWlViewDidLeave(callback: LifeCycleCallback) {
    if (callback.id) {
      const index = this.wlViewDidLeaveCallbacks.findIndex(
        x => x.id === callback.id
      );
      if (index > -1) {
        this.wlViewDidLeaveCallbacks[index] = callback;
      } else {
        this.wlViewDidLeaveCallbacks.push(callback);
      }
    } else {
      this.wlViewDidLeaveCallbacks.push(callback);
    }
  }

  wlViewDidLeave() {
    this.wlViewDidLeaveCallbacks.forEach(cb => cb());
    this.componentCanBeDestroyed();
  }

  onComponentCanBeDestroyed(callback: () => void) {
    this.componentCanBeDestroyedCallback = callback;
  }

  componentCanBeDestroyed() {
    if (this.componentCanBeDestroyedCallback) {
      this.componentCanBeDestroyedCallback();
    }
  }
};
