# Install

#### npm

```bash
npm install @wilfredlopez/wl-components
```

#### Or Script tag

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components/css/wl.bundle.css"
/>

<script
  type="module"
  src="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components/wl-components.esm.js"
></script>

<script
  nomodule
  src="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components.js"
></script>
```

Then you can use the element anywhere in
your template, JSX, html etc.

# Components

## `<wl-modal>`

```html
<wl-modal name="Wilfred">
  <h1 slot="title">My Title</h1>
  <div>
    <p>Modal Content</p>
    <p>Lorem ipsum dolor sit.</p>
  </div>
  <div slot="actions">
    <wl-button id="cancelBtn" color="secondary" size="small">Cancel</wl-button>
    <wl-button color="primary" size="small" id="daleBtn">Enter</wl-button>
  </div>
</wl-modal>
<script>
  const openButton = document.getElementById("openBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  const modal = document.querySelector("wl-modal");
  openButton.addEventListener("click", () => {
    modal.open();
  });
  cancelBtn.addEventListener("click", () => {
    modal.close();
  });
</script>
```

## `<wl-button>`

```html
<wl-button color="secondary">Click Me!</wl-button>
```

#### And more:

> `wl-app, wl-appbar, wl-button, wl-card, wl-grid, wl-col,wl-row, wl-container, wl-drawer, wl-drawer-body, wl-drawer-content, wl-flex, wl-input, wl-item, wl-label, wl-list, wl-modal, wl-spinner, wl-star, wl-text, wl-tooltip, wl-title.`

#### API Documentation

https://github.com/wilfredlopez/-wilfredlopez-wl-components/tree/master/src/components/`<COMPONENT_NAME>`

Example: https://github.com/wilfredlopez/-wilfredlopez-wl-components/tree/master/src/components/wl-star

### Full Example:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Example - wl-components</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components/css/wl.bundle.css"
    />
    <script
      type="module"
      src="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components/wl-components.esm.js"
    ></script>
    <script
      nomodule
      src="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components.js"
    ></script>
  </head>
  <body>
    <wl-appbar color="primary">
      <wl-drawer placement="left" color="primary">
        <wl-drawer-menu-button slot="button-open"></wl-drawer-menu-button>
        <wl-drawer-content>
          <wl-drawer-close-button color="primary"></wl-drawer-close-button>
          <wl-drawer-header>
            <wl-text color="primary">Wilfred Lopez</wl-text>
          </wl-drawer-header>
          <wl-drawer-body class="wl-no-padding">
            <wl-list>
              <wl-item button href="/" lines="none">
                <wl-label slot="start">😀</wl-label>
                <wl-label>Home</wl-label>
              </wl-item>
              <wl-item button lines="none">
                <wl-label slot="start">😂</wl-label>
                <wl-label>Link 2</wl-label>
              </wl-item>
            </wl-list>
          </wl-drawer-body>
        </wl-drawer-content>
        <wl-drawer-footer>
          <wl-flex>
            <wl-text color="primary">Lorem ipsum dolor sit amet.</wl-text>
          </wl-flex>
        </wl-drawer-footer>
      </wl-drawer>
      <wl-flex>
        <h1 class="wl-no-margin wl-margin-horizontal">WL COMPONENTS</h1>
      </wl-flex>
    </wl-appbar>

    <wl-container size="sm" class="wl-margin">
      <wl-card>
        <div slot="header">
          <h1 class="wl-no-padding wl-no-margin">Card Header</h1>
        </div>
        <div slot="content">Card Content</div>
        <div>
          Slotted Content
          <wl-tooltip message="Best Content!" color="primary"></wl-tooltip> for
          you.
        </div>
      </wl-card>
    </wl-container>
  </body>
</html>
```

### CSS Vars you can modify.

```css
:root {
  --wl-color-primary: #428cff;
  --wl-color-primary-rgb: 66, 140, 255;
  --wl-color-primary-contrast: #ffffff;
  --wl-color-primary-contrast-rgb: 255, 255, 255;
  --wl-color-primary-shade: #3a7be0;
  --wl-color-primary-tint: #5598ff;

  --wl-color-secondary: #50c8ff;
  --wl-color-secondary-rgb: 80, 200, 255;
  --wl-color-secondary-contrast: #ffffff;
  --wl-color-secondary-contrast-rgb: 255, 255, 255;
  --wl-color-secondary-shade: #46b0e0;
  --wl-color-secondary-tint: #62ceff;

  --wl-color-tertiary: #176497;
  --wl-color-tertiary-rgb: 106, 100, 255;
  --wl-color-tertiary-contrast: #ffffff;
  --wl-color-tertiary-contrast-rgb: 255, 255, 255;
  --wl-color-tertiary-shade: #0c598b;
  --wl-color-tertiary-tint: #2571a3;

  --wl-color-success: #2fdf75;
  --wl-color-success-rgb: 47, 223, 117;
  --wl-color-success-contrast: #000000;
  --wl-color-success-contrast-rgb: 0, 0, 0;
  --wl-color-success-shade: #29c467;
  --wl-color-success-tint: #44e283;

  --wl-color-warning: #ffd534;
  --wl-color-warning-rgb: 255, 213, 52;
  --wl-color-warning-contrast: #000000;
  --wl-color-warning-contrast-rgb: 0, 0, 0;
  --wl-color-warning-shade: #e0bb2e;
  --wl-color-warning-tint: #ffd948;

  --wl-color-danger: #ff4961;
  --wl-color-danger-rgb: 255, 73, 97;
  --wl-color-danger-contrast: #ffffff;
  --wl-color-danger-contrast-rgb: 255, 255, 255;
  --wl-color-danger-shade: #e04055;
  --wl-color-danger-tint: #ff5b71;

  --wl-color-dark: #000000;
  --wl-color-dark-rgb: 244, 245, 248;
  --wl-color-dark-contrast: #e4e4e4;
  --wl-color-dark-contrast-rgb: 0, 0, 0;
  --wl-color-dark-shade: #d7d8da;
  --wl-color-dark-tint: #f5f6f9;

  --wl-color-medium: #989aa2;
  --wl-color-medium-rgb: 152, 154, 162;
  --wl-color-medium-contrast: #000000;
  --wl-color-medium-contrast-rgb: 0, 0, 0;
  --wl-color-medium-shade: #86888f;
  --wl-color-medium-tint: #a2a4ab;

  --wl-color-light: #ffffff;
  --wl-color-light-rgb: 34, 36, 40;
  --wl-color-light-contrast: #030303;
  --wl-color-light-contrast-rgb: 255, 255, 255;
  --wl-color-light-shade: #1e2023;
  --wl-color-light-tint: #383a3e;
}

.ios {
  --wl-background-color: #000000;
  --wl-background-color-rgb: 0, 0, 0;

  --wl-text-color: #000000;
  --wl-text-color-rgb: 255, 255, 255;

  --wl-color-step-50: #0d0d0d;
  --wl-color-step-100: #1a1a1a;
  --wl-color-step-150: #262626;
  --wl-color-step-200: #333333;
  --wl-color-step-250: #404040;
  --wl-color-step-300: #4d4d4d;
  --wl-color-step-350: #595959;
  --wl-color-step-400: #666666;
  --wl-color-step-450: #737373;
  --wl-color-step-500: #808080;
  --wl-color-step-550: #8c8c8c;
  --wl-color-step-600: #999999;
  --wl-color-step-650: #a6a6a6;
  --wl-color-step-700: #b3b3b3;
  --wl-color-step-750: #bfbfbf;
  --wl-color-step-800: #cccccc;
  --wl-color-step-850: #d9d9d9;
  --wl-color-step-900: #e6e6e6;
  --wl-color-step-950: #f2f2f2;

  --wl-item-background: #f1f1f1;

  --wl-toolbar-background: #000;
  --wl-toolbar-color: #fff;
}

.md {
  --wl-background-color: #121212;
  --wl-background-color-rgb: 18, 18, 18;

  --wl-text-color: #000000;
  --wl-text-color-rgb: 255, 255, 255;

  --wl-border-color: #222222;

  --wl-color-step-50: #1e1e1e;
  --wl-color-step-100: #2a2a2a;
  --wl-color-step-150: #363636;
  --wl-color-step-200: #414141;
  --wl-color-step-250: #4d4d4d;
  --wl-color-step-300: #595959;
  --wl-color-step-350: #656565;
  --wl-color-step-400: #717171;
  --wl-color-step-450: #7d7d7d;
  --wl-color-step-500: #898989;
  --wl-color-step-550: #949494;
  --wl-color-step-600: #a0a0a0;
  --wl-color-step-650: #acacac;
  --wl-color-step-700: #b8b8b8;
  --wl-color-step-750: #c4c4c4;
  --wl-color-step-800: #d0d0d0;
  --wl-color-step-850: #dbdbdb;
  --wl-color-step-900: #e7e7e7;
  --wl-color-step-950: #f3f3f3;

  --wl-item-background: #ffffff;
}
```

## Github

https://github.com/wilfredlopez/-wilfredlopez-wl-components

### Stencil

Stencil is a compiler for building fast web apps using Web Components.

Stencil combines the best concepts of the most popular frontend frameworks into a compile-time rather than run-time tool. Stencil takes TypeScript, JSX, a tiny virtual DOM layer, efficient one-way data binding, an asynchronous rendering pipeline (similar to React Fiber), and lazy-loading out of the box, and generates 100% standards-based Web Components that run in any browser supporting the Custom Elements v1 spec.

Stencil components are just Web Components, so they work in any major framework or with no framework at all.
