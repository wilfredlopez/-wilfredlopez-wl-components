# Install

#### npm
```bash
npm install @wilfredlopez/wl-components
```

#### Or Script tag

```html
  <link rel="stylesheet" href="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components/css/wl.bundle.css" />
  
  <script  type="module" src="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components/wl-components.esm.js"></script>

  <script nomodule src="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components.js"></script>
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
    <p>
     Lorem ipsum dolor sit.
    </p>
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
>  `wl-app, wl-appbar, wl-button, wl-card, wl-grid, wl-col,wl-row, wl-container, wl-drawer, wl-drawer-body, wl-drawer-content, wl-flex, wl-input, wl-item, wl-label, wl-list, wl-modal, wl-spinner, wl-star, wl-text, wl-tooltip.`

#### API Documentation

https://github.com/wilfredlopez/-wilfredlopez-wl-components/tree/master/src/components/`<COMPONENT_NAME>`

Example: https://github.com/wilfredlopez/-wilfredlopez-wl-components/tree/master/src/components/wl-star



### Full Example: 
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Example - wl-components</title>
  <link rel="stylesheet" href="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components/css/wl.bundle.css">
  <script  type="module" src="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components/wl-components.esm.js"></script>
  <script nomodule src="https://unpkg.com/@wilfredlopez/wl-components@latest/dist/wl-components.js"></script>
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
      Slotted Content <wl-tooltip message="Best Content!" color="primary"></wl-tooltip> for you.
    </div>
  </wl-card>
</wl-container>

</body>

</html>
```

## Github

https://github.com/wilfredlopez/-wilfredlopez-wl-components

### Stencil

Stencil is a compiler for building fast web apps using Web Components.

Stencil combines the best concepts of the most popular frontend frameworks into a compile-time rather than run-time tool. Stencil takes TypeScript, JSX, a tiny virtual DOM layer, efficient one-way data binding, an asynchronous rendering pipeline (similar to React Fiber), and lazy-loading out of the box, and generates 100% standards-based Web Components that run in any browser supporting the Custom Elements v1 spec.

Stencil components are just Web Components, so they work in any major framework or with no framework at all.
