export type ComponentRef = Function | HTMLElement | string | null;

export interface FrameworkDelegate {
  attachViewToDom(
    container: any,
    component: any,
    propsOrDataObj?: any,
    cssClasses?: string[]
  ): Promise<HTMLElement>;
  removeViewFromDom(container: any, component: any): Promise<void>;
}

//@ts-ignore
export type ComponentProps<T = null> = { [key: string]: any };
