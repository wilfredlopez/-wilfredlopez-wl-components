/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { Color, } from "./components/interfaces/Color.model";
import { Breakpoints, } from "./components/interfaces/Breakpoints.model";
export namespace Components {
    interface WlButton {
        "color": Color;
        /**
          * If `true`, the user cannot interact with the button.
         */
        "disabled": boolean;
        "size": "small" | "large" | "default";
        "squared": boolean;
        /**
          * The type of the button.
         */
        "type": "submit" | "reset" | "button";
        "variant": "outline" | "filled" | "clear";
    }
    interface WlContainer {
        "fluid": boolean;
        "maxWidth": Breakpoints;
        "size": Breakpoints;
    }
    interface WlModal {
        "close": () => Promise<boolean>;
        "open": () => Promise<unknown>;
        "show": boolean;
    }
}
declare global {
    interface HTMLWlButtonElement extends Components.WlButton, HTMLStencilElement {
    }
    var HTMLWlButtonElement: {
        prototype: HTMLWlButtonElement;
        new (): HTMLWlButtonElement;
    };
    interface HTMLWlContainerElement extends Components.WlContainer, HTMLStencilElement {
    }
    var HTMLWlContainerElement: {
        prototype: HTMLWlContainerElement;
        new (): HTMLWlContainerElement;
    };
    interface HTMLWlModalElement extends Components.WlModal, HTMLStencilElement {
    }
    var HTMLWlModalElement: {
        prototype: HTMLWlModalElement;
        new (): HTMLWlModalElement;
    };
    interface HTMLElementTagNameMap {
        "wl-button": HTMLWlButtonElement;
        "wl-container": HTMLWlContainerElement;
        "wl-modal": HTMLWlModalElement;
    }
}
declare namespace LocalJSX {
    interface WlButton {
        "color"?: Color;
        /**
          * If `true`, the user cannot interact with the button.
         */
        "disabled"?: boolean;
        "size"?: "small" | "large" | "default";
        "squared"?: boolean;
        /**
          * The type of the button.
         */
        "type"?: "submit" | "reset" | "button";
        "variant"?: "outline" | "filled" | "clear";
    }
    interface WlContainer {
        "fluid"?: boolean;
        "maxWidth"?: Breakpoints;
        "size"?: Breakpoints;
    }
    interface WlModal {
        "show"?: boolean;
    }
    interface IntrinsicElements {
        "wl-button": WlButton;
        "wl-container": WlContainer;
        "wl-modal": WlModal;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "wl-button": LocalJSX.WlButton & JSXBase.HTMLAttributes<HTMLWlButtonElement>;
            "wl-container": LocalJSX.WlContainer & JSXBase.HTMLAttributes<HTMLWlContainerElement>;
            "wl-modal": LocalJSX.WlModal & JSXBase.HTMLAttributes<HTMLWlModalElement>;
        }
    }
}
