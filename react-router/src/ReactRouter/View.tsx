import { NavContext, WlLifeCycleContext } from '@wilfredlopez/react';
import React from 'react';
import { Redirect } from 'react-router';

import { isDevMode } from '../utils';

import { ViewItem } from './ViewItem';

interface ViewProps extends React.HTMLAttributes<HTMLElement> {
  onViewSync: (page: HTMLElement, viewId: string) => void;
  onHideView: (viewId: string) => void;
  view: ViewItem;
  route: any;
}

/**
 * The View component helps manage the WlPage's lifecycle and registration
 */
export class View extends React.Component<ViewProps, {}> {
  context!: React.ContextType<typeof WlLifeCycleContext>;
  wlPage?: HTMLElement;

  componentDidMount() {
    /**
     * If we can tell if view is a redirect, hide it so it will work again in future
     */
    const { view, route } = this.props;
    if (route.type === Redirect) {
      this.props.onHideView(view.id);
    } else if (route.props.render && !view.isWlRoute) {
      // Test the render to see if it returns a redirect
      if (route.props.render().type === Redirect) {
        this.props.onHideView(view.id);
      }
    }
  }

  componentWillUnmount() {
    if (this.wlPage) {
      this.wlPage.removeEventListener(
        'wlViewWillEnter',
        this.wlViewWillEnterHandler.bind(this)
      );
      this.wlPage.removeEventListener(
        'wlViewDidEnter',
        this.wlViewDidEnterHandler.bind(this)
      );
      this.wlPage.removeEventListener(
        'wlViewWillLeave',
        this.wlViewWillLeaveHandler.bind(this)
      );
      this.wlPage.removeEventListener(
        'wlViewDidLeave',
        this.wlViewDidLeaveHandler.bind(this)
      );
    }
  }

  wlViewWillEnterHandler() {
    this.context.wlViewWillEnter();
  }

  wlViewDidEnterHandler() {
    this.context.wlViewDidEnter();
  }

  wlViewWillLeaveHandler() {
    this.context.wlViewWillLeave();
  }

  wlViewDidLeaveHandler() {
    this.context.wlViewDidLeave();
  }

  registerWlPage(page: HTMLElement) {
    this.wlPage = page;
    this.wlPage.addEventListener(
      'wlViewWillEnter',
      this.wlViewWillEnterHandler.bind(this)
    );
    this.wlPage.addEventListener(
      'wlViewDidEnter',
      this.wlViewDidEnterHandler.bind(this)
    );
    this.wlPage.addEventListener(
      'wlViewWillLeave',
      this.wlViewWillLeaveHandler.bind(this)
    );
    this.wlPage.addEventListener(
      'wlViewDidLeave',
      this.wlViewDidLeaveHandler.bind(this)
    );
    this.wlPage.classList.add('wl-page-invisible');
    if (isDevMode()) {
      this.wlPage.setAttribute('data-view-id', this.props.view.id);
    }
    this.props.onViewSync(page, this.props.view.id);
  }

  render() {
    return (
      <NavContext.Consumer>
        {value => {
          const newProvider = {
            ...value,
            registerWlPage: this.registerWlPage.bind(this),
          };

          return (
            <NavContext.Provider value={newProvider}>
              {this.props.children}
            </NavContext.Provider>
          );
        }}
      </NavContext.Consumer>
    );
  }

  static get contextType() {
    return WlLifeCycleContext;
  }
}
