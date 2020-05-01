# wl-route-redirect



<!-- Auto Generated Below -->


## Usage

### Javascript

```html
<!-- Redirects when the user navigates to `/admin` but
will NOT redirect if the user navigates to `/admin/posts` -->
<wl-route-redirect from="/admin" to="/login"></wl-route-redirect>

<!-- By adding the wilcard character (*), the redirect will match
any subpath of admin -->
<wl-route-redirect from="/admin/*" to="/login"></wl-route-redirect>
```

### Route Redirects as Guards

Redirection routes can work as guards to prevent users from navigating to certain areas of an application based on a given condition, such as if the user is authenticated or not.

A route redirect can be added and removed dynamically to redirect (or guard) some routes from being accessed. In the following example, all urls `*` will be redirected to the `/login` url if `isLoggedIn` is `false`.

```tsx
const isLoggedIn = false;

const router = document.querySelector("wl-router");
const routeRedirect = document.createElement("wl-route-redirect");
routeRedirect.setAttribute("from", "*");
routeRedirect.setAttribute("to", "/login");

if (!isLoggedIn) {
  router.appendChild(routeRedirect);
}
```

Alternatively, the value of `to` can be modified based on a condition. In the following example, the route redirect will check if the user is logged in and redirect to the `/login` url if not.

```html
<wl-route-redirect id="tutorialRedirect" from="*"></wl-route-redirect>
```

```javascript
const isLoggedIn = false;
const routeRedirect = document.querySelector("#tutorialRedirect");

routeRedirect.setAttribute("to", isLoggedIn ? undefined : "/login");
```



## Properties

| Property            | Attribute | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Type                          | Default     |
| ------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------- |
| `from` _(required)_ | `from`    | A redirect route, redirects "from" a URL "to" another URL. This property is that "from" URL. It needs to be an exact match of the navigated URL in order to apply.  The path specified in this value is always an absolute path, even if the initial `/` slash is not specified.                                                                                                                                                                                                                                                                                                                                                                                                              | `string`                      | `undefined` |
| `to` _(required)_   | `to`      | A redirect route, redirects "from" a URL "to" another URL. This property is that "to" URL. When the defined `wl-route-redirect` rule matches, the router will redirect to the path specified in this property.  The value of this property is always an absolute path inside the scope of routes defined in `wl-router` it can't be used with another router or to perform a redirection to a different domain.  Note that this is a virtual redirect, it will not cause a real browser refresh, again, it's a redirect inside the context of wl-router.  When this property is not specified or his value is `undefined` the whole redirect route is noop, even if the "from" value matches. | `null \| string \| undefined` | `undefined` |


## Events

| Event                    | Description                                                                                                                                                                                                              | Type               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `wlRouteRedirectChanged` | Internal event that fires when any value of this rule is added/removed from the DOM, or any of his public properties changes.  `wl-router` captures this event in order to update his internal registry of router rules. | `CustomEvent<any>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
