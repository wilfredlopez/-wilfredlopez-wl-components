# wl-router



<!-- Auto Generated Below -->


## Usage

### Javascript

```html
<wl-router>
  <wl-route component="page-tabs">
    <wl-route url="/schedule" component="tab-schedule">
      <wl-route component="page-schedule"></wl-route>
      <wl-route url="/session/:sessionId" component="page-session"></wl-route>
    </wl-route>

    <wl-route url="/speakers" component="tab-speaker">
      <wl-route component="page-speaker-list"></wl-route>
      <wl-route url="/session/:sessionId" component="page-session"></wl-route>
      <wl-route url="/:speakerId" component="page-speaker-detail"></wl-route>
    </wl-route>

    <wl-route url="/map" component="page-map"></wl-route>
    <wl-route url="/about" component="page-about"></wl-route>
  </wl-route>

  <wl-route url="/tutorial" component="page-tutorial"></wl-route>
  <wl-route url="/login" component="page-login"></wl-route>
  <wl-route url="/account" component="page-account"></wl-route>
  <wl-route url="/signup" component="page-signup"></wl-route>
  <wl-route url="/support" component="page-support"></wl-route>
</wl-router>
```



## Properties

| Property  | Attribute  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Type      | Default |
| --------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `root`    | `root`     | By default `wl-router` will match the routes at the root path ("/"). That can be changed when                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `string`  | `"/"`   |
| `useHash` | `use-hash` | The router can work in two "modes": - With hash: `/index.html#/path/to/page` - Without hash: `/path/to/page`  Using one or another might depend in the requirements of your app and/or where it's deployed.  Usually "hash-less" navigation works better for SEO and it's more user friendly too, but it might requires additional server-side configuration in order to properly work.  On the otherside hash-navigation is much easier to deploy, it even works over the file protocol.  By default, this property is `true`, change to `false` to allow hash-less URLs. | `boolean` | `true`  |


## Events

| Event               | Description                                     | Type                             |
| ------------------- | ----------------------------------------------- | -------------------------------- |
| `wlRouteDidChange`  | Emitted when the route had changed              | `CustomEvent<RouterEventDetail>` |
| `wlRouteWillChange` | Event emitted when the route is about to change | `CustomEvent<RouterEventDetail>` |


## Methods

### `back() => Promise<void>`

Go back to previous page in the window.history.

#### Returns

Type: `Promise<void>`



### `push(url: string, direction?: RouterDirection) => Promise<boolean>`

Navigate to the specified URL.

#### Returns

Type: `Promise<boolean>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
