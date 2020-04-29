import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";

export const config: Config = {
  namespace: "wl-components",
  taskQueue: "async",
  enableCache: true,
  bundles: [
    { components: ["wl-grid", "wl-row", "wl-col"] },
    {
      components: [
        "wl-drawer",
        "wl-drawer-body",
        "wl-drawer-close-button",
        "wl-drawer-content",
        "wl-drawer-footer",
        "wl-drawer-header",
        "wl-drawer-menu-button",
      ],
    },
  ],
  // devMode: true,
  // devServer: {
  //   reloadStrategy: "hmr",
  // },
  outputTargets: [
    {
      type: "www",
      copy: [
        {
          src: "../css",
          dest: "./css",
        },
      ],
    },
    {
      type: "dist",
      esmLoaderPath: "../loader",
    },
    {
      type: "docs-readme",
    },
    {
      type: "dist-hydrate-script",
    },
  ],
  plugins: [
    sass({
      injectGlobalPaths: ["src/themes/wl.skip-warns.scss"],
    }),
  ],
};
