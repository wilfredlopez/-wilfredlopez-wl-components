import { DefaultWlLifeCycleContext, WlLifeCycleContext, } from "@wilfredlopez/react";
import React from "react";
import { RouteManagerContext } from "./RouteManagerContext";
/**
 * Manages the View's DOM lifetime by keeping it around long enough to complete page transitions before removing it.
 */
export class ViewTransitionManager extends React.Component {
    constructor(props) {
        super(props);
        this.WlLifeCycleContext = new DefaultWlLifeCycleContext();
        this._isMounted = false;
        this.state = {
            show: true,
        };
        this.WlLifeCycleContext.onComponentCanBeDestroyed(() => {
            if (!this.props.mount) {
                if (this._isMounted) {
                    this.setState({
                        show: false,
                    }, () => {
                        this.context.hideView(this.props.id);
                    });
                }
            }
        });
    }
    componentDidMount() {
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    render() {
        const { show } = this.state;
        return (React.createElement(WlLifeCycleContext.Provider, { value: this.WlLifeCycleContext }, show && this.props.children));
    }
    static get contextType() {
        return RouteManagerContext;
    }
}
//# sourceMappingURL=ViewTransitionManager.js.map