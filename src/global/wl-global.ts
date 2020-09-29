// import { getMode, setMode } from "@stencil/core";

// import { Mode } from "../interfaces";
// import { isPlatform, setupPlatforms } from "../utils/platform";

// import { config, configFromSession, configFromURL, saveConfig } from "./config";

// declare const Context: any;

// let defaultMode: Mode;

// export const getWlMode = (ref?: any): Mode => {
//   if (ref) {
//     return getMode(ref) || defaultMode;
//   }
//   return defaultMode;
// };

// export default () => {
//   const doc = document;
//   const win = window;
//   Context.config = config;
//   const Wl = ((win as any).Wl = (win as any).Wl || {});

//   // Setup platforms
//   setupPlatforms(win);

//   // create the Wl.config from raw config object (if it exists)
//   // and convert Wl.config into a ConfigApi that has a get() fn
//   const configObj = {
//     ...configFromSession(win),
//     persistConfig: false,
//     ...Wl.config,
//     ...configFromURL(win),
//   };

//   config.reset(configObj);
//   if (config.getBoolean("persistConfig")) {
//     saveConfig(win, configObj);
//   }

//   // first see if the mode was set as an attribute on <html>
//   // which could have been set by the user, or by pre-rendering
//   // otherwise get the mode via config settings, and fallback to md
//   Wl.config = config;
//   defaultMode = config.get(
//     "mode",
//     doc.documentElement.getAttribute("mode") ||
//       (isPlatform(win, "ios") ? "ios" : "md")
//   );
//   Wl.mode = defaultMode;
//   config.set("mode", defaultMode);
//   doc.documentElement.setAttribute("mode", defaultMode);
//   doc.documentElement.classList.add(defaultMode);

//   if (config.getBoolean("_testing")) {
//     config.set("animated", false);
//   }

//   const isWlElement = (elm: any) =>
//     elm.tagName && elm.tagName.startsWith("WL-");

//   const isAllowedWlModeValue = (elmMode: string) =>
//     ["ios", "md"].includes(elmMode);

//   setMode((elm: any) => {
//     while (elm) {
//       const elmMode = (elm as any).mode || elm.getAttribute("mode");

//       if (elmMode) {
//         if (isAllowedWlModeValue(elmMode)) {
//           return elmMode;
//         } else if (isWlElement(elm)) {
//           console.warn(
//             'Invalid wl mode: "' + elmMode + '", expected: "ios" or "md"'
//           );
//         }
//       }
//       elm = elm.parentElement;
//     }
//     return defaultMode;
//   });
// };

import { getMode, setMode } from "@stencil/core";

import { Mode } from "../interfaces";
import { isPlatform, setupPlatforms } from "../utils/platform";

import { config, configFromSession, configFromURL, saveConfig } from "./config";

declare const Context: any;

let defaultMode: Mode;

export const getWlMode = (ref?: any): Mode => {
  return (ref && getMode(ref)) || defaultMode;
};

export default () => {
  const doc = document;
  const win = window;
  Context.config = config;
  const WL = ((win as any).Wl = (win as any).Wl || {});

  // Setup platforms
  setupPlatforms(win);

  // create the WL.config from raw config object (if it exists)
  // and convert WL.config into a ConfigApi that has a get() fn
  const configObj = {
    ...configFromSession(win),
    persistConfig: false,
    ...WL.config,
    ...configFromURL(win),
  };

  config.reset(configObj);
  if (config.getBoolean("persistConfig")) {
    saveConfig(win, configObj);
  }

  // first see if the mode was set as an attribute on <html>
  // which could have been set by the user, or by pre-rendering
  // otherwise get the mode via config settings, and fallback to md
  WL.config = config;
  WL.mode = defaultMode = config.get(
    "mode",
    doc.documentElement.getAttribute("mode") ||
      (isPlatform(win, "ios") ? "ios" : "md")
  );
  config.set("mode", defaultMode);
  doc.documentElement.setAttribute("mode", defaultMode);
  doc.documentElement.classList.add(defaultMode);

  if (config.getBoolean("_testing")) {
    config.set("animated", false);
  }

  const isWlElement = (elm: any) =>
    elm.tagName && elm.tagName.startsWith("WL-");

  const isAllowedWlModeValue = (elmMode: string) =>
    ["ios", "md"].includes(elmMode);

  setMode((elm: any) => {
    while (elm) {
      const elmMode = (elm as any).mode || elm.getAttribute("mode");
      if (elmMode) {
        if (isAllowedWlModeValue(elmMode)) {
          return elmMode;
        } else if (isWlElement(elm)) {
          console.warn(
            'Invalid WL mode: "' + elmMode + '", expected: "ios" or "md"'
          );
        }
      }
      elm = elm.parentElement;
    }
    return defaultMode;
  });
};
