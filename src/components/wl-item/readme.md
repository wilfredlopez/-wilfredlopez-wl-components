# wl-item



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                                                                                                                                                                                                                                               | Type                                                                                                                         | Default     |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `button`   | `button`   | If `true`, a button tag will be rendered and the item will be tappable.                                                                                                                                                                                                                   | `boolean`                                                                                                                    | `false`     |
| `color`    | `color`    | The color to use from your application's color palette. Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`. For more information on colors, see [theming](/docs/theming/basics).                    | `"danger" \| "dark" \| "light" \| "medium" \| "primary" \| "secondary" \| "success" \| "tertiary" \| "warning" \| undefined` | `undefined` |
| `disabled` | `disabled` | If `true`, the user cannot interact with the item.                                                                                                                                                                                                                                        | `boolean`                                                                                                                    | `false`     |
| `download` | `download` | This attribute instructs browsers to download a URL instead of navigating to it, so the user will be prompted to save it as a local file. If the attribute has a value, it is used as the pre-filled file name in the Save prompt (the user can still change the file name if they want). | `string \| undefined`                                                                                                        | `undefined` |
| `href`     | `href`     | Contains a URL or a URL fragment that the hyperlink points to. If this property is set, an anchor tag will be rendered.                                                                                                                                                                   | `string \| undefined`                                                                                                        | `undefined` |
| `lines`    | `lines`    | How the bottom border should be displayed on the item.                                                                                                                                                                                                                                    | `"full" \| "inset" \| "none" \| undefined`                                                                                   | `'none'`    |
| `mode`     | `mode`     | The mode determines which platform styles to use.                                                                                                                                                                                                                                         | `"ios" \| "md"`                                                                                                              | `undefined` |
| `rel`      | `rel`      | Specifies the relationship of the target object to the link object. The value is a space-separated list of [link types](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).                                                                                                    | `string \| undefined`                                                                                                        | `undefined` |
| `target`   | `target`   | Specifies where to display the linked URL. Only applies when an `href` is provided. Special keywords: `"_blank"`, `"_self"`, `"_parent"`, `"_top"`.                                                                                                                                       | `string \| undefined`                                                                                                        | `undefined` |
| `type`     | `type`     | The type of the button. Only used when an `onclick` or `button` property is present.                                                                                                                                                                                                      | `"button" \| "reset" \| "submit"`                                                                                            | `"button"`  |


## Slots

| Slot      | Description                                                                     |
| --------- | ------------------------------------------------------------------------------- |
|           | Content is placed between the named slots if provided without a slot.           |
| `"end"`   | Content is placed to the right of the item text in LTR, and to the left in RTL. |
| `"start"` | Content is placed to the left of the item text in LTR, and to the right in RTL. |


## CSS Custom Properties

| Name                             | Description                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `--background`                   | Background of the item                                                                                        |
| `--background-activated`         | Background of the item when pressed. Note: setting this will interfere with the Material Design ripple.       |
| `--background-activated-opacity` | Opacity of the item background when pressed                                                                   |
| `--background-focused`           | Background of the item when focused with the tab key                                                          |
| `--background-focused-opacity`   | Opacity of the item background when focused with the tab key                                                  |
| `--background-hover`             | Background of the item on hover                                                                               |
| `--background-hover-opacity`     | Opacity of the background of the item on hover                                                                |
| `--border-color`                 | Color of the item border                                                                                      |
| `--border-radius`                | Radius of the item border                                                                                     |
| `--border-style`                 | Style of the item border                                                                                      |
| `--border-width`                 | Width of the item border                                                                                      |
| `--color`                        | Color of the item                                                                                             |
| `--color-activated`              | Color of the item when pressed                                                                                |
| `--color-focused`                | Color of the item when focused with the tab key                                                               |
| `--color-hover`                  | Color of the item on hover                                                                                    |
| `--detail-icon-color`            | Color of the item detail icon                                                                                 |
| `--detail-icon-font-size`        | Font size of the item detail icon                                                                             |
| `--detail-icon-opacity`          | Opacity of the item detail icon                                                                               |
| `--highlight-color-focused`      | The color of the highlight on the item when focused                                                           |
| `--highlight-color-invalid`      | The color of the highlight on the item when invalid                                                           |
| `--highlight-color-valid`        | The color of the highlight on the item when valid                                                             |
| `--highlight-height`             | The height of the highlight on the item                                                                       |
| `--inner-border-width`           | Width of the item inner border                                                                                |
| `--inner-box-shadow`             | Box shadow of the item inner                                                                                  |
| `--inner-padding-bottom`         | Bottom padding of the item inner                                                                              |
| `--inner-padding-end`            | Right padding if direction is left-to-right, and left padding if direction is right-to-left of the item inner |
| `--inner-padding-start`          | Left padding if direction is left-to-right, and right padding if direction is right-to-left of the item inner |
| `--inner-padding-top`            | Top padding of the item inner                                                                                 |
| `--min-height`                   | Minimum height of the item                                                                                    |
| `--padding-bottom`               | Bottom padding of the item                                                                                    |
| `--padding-end`                  | Right padding if direction is left-to-right, and left padding if direction is right-to-left of the item       |
| `--padding-start`                | Left padding if direction is left-to-right, and right padding if direction is right-to-left of the item       |
| `--padding-top`                  | Top padding of the item                                                                                       |
| `--ripple-color`                 | Color of the item ripple effect                                                                               |
| `--transition`                   | Transition of the item                                                                                        |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
