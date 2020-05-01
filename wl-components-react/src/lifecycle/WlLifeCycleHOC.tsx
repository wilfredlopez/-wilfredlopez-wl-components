import React from "react";

import { WlLifeCycleContext } from "../contexts/WlLifeCycleContext";

export const withWlLifeCycle = (WrappedComponent: React.ComponentType<any>) => {
  return class WlLifeCycle extends React.Component<any, any> {
    context!: React.ContextType<typeof WlLifeCycleContext>;
    componentRef = React.createRef<any>();

    constructor(props: any) {
      super(props);
    }

    componentDidMount() {
      const element = this.componentRef.current;
      this.context.onWlViewWillEnter(() => {
        if (element && element.wlViewWillEnter) {
          element.wlViewWillEnter();
        }
      });

      this.context.onWlViewDidEnter(() => {
        if (element && element.wlViewDidEnter) {
          element.wlViewDidEnter();
        }
      });

      this.context.onWlViewWillLeave(() => {
        if (element && element.wlViewWillLeave) {
          element.wlViewWillLeave();
        }
      });

      this.context.onWlViewDidLeave(() => {
        if (element && element.wlViewDidLeave) {
          element.wlViewDidLeave();
        }
      });
    }

    render() {
      return (
        <WlLifeCycleContext.Consumer>
          {(context) => {
            this.context = context;
            return <WrappedComponent ref={this.componentRef} {...this.props} />;
          }}
        </WlLifeCycleContext.Consumer>
      );
    }
  };
};
