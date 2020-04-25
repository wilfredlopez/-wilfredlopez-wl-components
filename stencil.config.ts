import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";

export const config: Config = {
  namespace: "wl-components",
  taskQueue: "async",
  enableCache: true,
  bundles: [{ components: ["wl-grid", "wl-row", "wl-col"] }],
  // devMode: true,
  // devServer: {
  //   reloadStrategy: "hmr",
  // },
  outputTargets: [
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
    {
      type: "www",
    },
  ],
  plugins: [
    sass({
      injectGlobalPaths: ["src/themes/wl.skip-warns.scss"],
    }),
  ],
};
