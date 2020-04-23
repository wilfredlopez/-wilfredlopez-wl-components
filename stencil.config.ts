import { Config } from "@stencil/core";

export const config: Config = {
  namespace: "wl-components",
  taskQueue: "async",
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",
    },
    {
      type: "docs-readme",
    },
  ],
};
