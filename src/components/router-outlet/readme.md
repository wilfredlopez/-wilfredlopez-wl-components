# wl-router-outlet

Router outlet is a component used in routing within an Angular app. It behaves in a similar way to Angular's built-in router outlet component, but contains the logic for providing a stacked navigation, and animating views in and out.

> Note: this component should only be used with Angular projects. For vanilla or Stencil JavaScript projects, use [`wl-router`](../router) and [`wl-route`](../route).

Although router outlet has methods for navigating around, it's recommended to use the navigation methods in Angular's router.

### Life Cycle Hooks

Routes rendered in a Router Outlet have access to specific events that are wired up to animations

| Event Name        | Trigger                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `wlViewWillEnter` | Fired when the component being routed to is about to animate in. |
| `wlViewDidEnter`  | Fired when the component being routed to has animated in.        |
| `wlViewWillLeave` | Fired when the component being routed from is about to animate.  |
| `wlViewDidLeave`  | Fired when the component being routed from has animated.         |

These event tie into animation system and can be used to coordinate parts of your app when a Components is done with it's animation. These events are not a replacement for Angular's own event system, but an addition.

For handling Router Guards, the older `wlViewCanEnter` and `wlViewCanLeave` have been replaced with their framework specific equivalent. For Angular, there are [Router Guards](https://angular.io/guide/router#milestone-5-route-guards).

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute  | Description                                                                                                                                                                                   | Type                                                    | Default     |
| ----------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------- |
| `animated`  | `animated` | If `true`, the router-outlet should animate the transition of components.                                                                                                                     | `boolean`                                               | `true`      |
| `animation` | --         | By default `wl-nav` animates transition between pages based in the mode (ios or material design). However, this property allows to create custom transition using `AnimateBuilder` functions. | `((baseEl: any, opts?: any) => Animation) \| undefined` | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
