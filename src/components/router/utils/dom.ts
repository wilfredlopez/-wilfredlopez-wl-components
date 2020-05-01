import { ROUTER_INTENT_NONE } from "./constants";
import {
  RouteChain,
  RouterDirection,
  RouteID,
  NavOutletElement,
} from "./interface";

export const writeNavState = async (
  root: HTMLElement | undefined,
  chain: RouteChain,
  direction: RouterDirection,
  index: number,
  changed = false
): Promise<boolean> => {
  try {
    // find next navigation outlet in the DOM
    const outlet = searchNavNode(root);

    // make sure we can continue interacting the DOM, otherwise abort
    if (index >= chain.length || !outlet) {
      return changed;
    }
    await outlet.componentOnReady();

    const route = chain[index];
    const result = await outlet.setRouteId(route.id, route.params, direction);

    // if the outlet changed the page, reset navigation to neutral (no direction)
    // this means nested outlets will not animate
    if (result.changed) {
      direction = ROUTER_INTENT_NONE;
      changed = true;
    }

    // recursively set nested outlets
    changed = await writeNavState(
      result.element,
      chain,
      direction,
      index + 1,
      changed
    );

    // once all nested outlets are visible let's make the parent visible too,
    // using markVisible prevents flickering
    if (result.markVisible) {
      await result.markVisible();
    }
    return changed;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const readNavState = async (root: HTMLElement | undefined) => {
  const ids: RouteID[] = [];
  let outlet: NavOutletElement | undefined;
  let node: HTMLElement | undefined = root;
  // tslint:disable-next-line:no-constant-condition
  while (true) {
    outlet = searchNavNode(node);
    if (outlet) {
      const id = await outlet.getRouteId();
      if (id) {
        node = id.element;
        id.element = undefined;
        ids.push(id);
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return { ids, outlet };
};

export const waitUntilNavNode = () => {
  if (searchNavNode(document.body)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    window.addEventListener("wlNavWillLoad", resolve, { once: true });
  });
};

const QUERY =
  ":not([no-router]) wl-nav, :not([no-router]) wl-tabs, :not([no-router]) wl-router-outlet";

const searchNavNode = (
  root: HTMLElement | undefined
): NavOutletElement | undefined => {
  if (!root) {
    return undefined;
  }
  if (root.matches(QUERY)) {
    return root as NavOutletElement;
  }
  const outlet = root.querySelector<NavOutletElement>(QUERY);
  return outlet ? outlet : undefined;
};
