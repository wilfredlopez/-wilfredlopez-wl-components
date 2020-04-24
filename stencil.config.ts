import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";

export const config: Config = {
  namespace: "wl-components",
  taskQueue: "async",
  devMode: true,
  devServer: {
    reloadStrategy: "hmr",
  },
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",
    },
    {
      type: "docs-readme",
    },
    {
      type: "www",
      empty: true,
    },
  ],
  plugins: [
    sass({
      injectGlobalPaths: ["src/themes/wl.global.scss"],
    }),
  ],
};
