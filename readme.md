# Install

```bash
npm install @wilfredlopez/wl-components
```

#### Script tag

Put a script tag similar to this

```html
<script src="https://unpkg.com/@wilfredlopez/wl-components@0.0.1/dist/wl-components.js"></script>
```

in the head of your index.html - Then you can use the element anywhere in
your template, JSX, html etc.

# Components

## `<wl-modal>`

```html
<wl-modal name="Wilfred">
  <h1 slot="title">My Custom Title</h1>
  <div>
    <p>My Modal Content</p>
    <p>You know me.</p>
  </div>
  <div slot="actions">
    <wl-button id="cancelBtn" color="secondary" size="small">Cancel</wl-button>
    <wl-button color="primary" size="small" id="daleBtn">Dale</wl-button>
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

### Github

https://github.com/wilfredlopez/-wilfredlopez-wl-components

### Stencil

Stencil is a compiler for building fast web apps using Web Components.

Stencil combines the best concepts of the most popular frontend frameworks into a compile-time rather than run-time tool. Stencil takes TypeScript, JSX, a tiny virtual DOM layer, efficient one-way data binding, an asynchronous rendering pipeline (similar to React Fiber), and lazy-loading out of the box, and generates 100% standards-based Web Components that run in any browser supporting the Custom Elements v1 spec.

Stencil components are just Web Components, so they work in any major framework or with no framework at all.
