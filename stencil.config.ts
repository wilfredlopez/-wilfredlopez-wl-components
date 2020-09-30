import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import { OutputTarget, OutputTargetWww } from "@stencil/core/internal";

const devTarget = {
  type: "www",
  copy: [
    {
      src: "../css",
      dest: "./css",
    },
  ],
} as OutputTargetWww;

const DEV_TARGETS: OutputTarget[] = [
  {
    type: "dist",
    copy: [
      {
        src: "../css",
        dest: "./css",
      },
    ],
    esmLoaderPath: "../loader",
  },
  {
    type: "docs-readme",
  },
  {
    type: "dist-hydrate-script",
  },
];

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
  outputTargets:
    process.env.NODE_ENV === "development"
      ? DEV_TARGETS
      : [
          {
            type: "dist",
            copy: [
              {
                src: "../css",
                dest: "./css",
              },
            ],
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
  globalScript: "src/global/wl-global.ts",
  extras: {
    cssVarsShim: true,
    dynamicImportShim: true,
    initializeNextTick: true,
    safari10: true,
    scriptDataOpts: true,
    shadowDomShim: true,
  },
};

if (process.env.NODE_ENV === "development") {
  config.outputTargets.push(devTarget);
  config.devMode = true;
  config.devServer = {
    reloadStrategy: "hmr",
  };
}
