import { readTask, writeTask } from "@stencil/core";

export const startStatusTap = () => {
  const win = window;
  win.addEventListener("statusTap", () => {
    readTask(() => {
      const width = win.innerWidth;
      const height = win.innerHeight;
      const el = document.elementFromPoint(
        width / 2,
        height / 2
      ) as Element | null;
      if (!el) {
        return;
      }
      //TODO:: need to create w-content element
      // const contentEl = el.closest("wl-content");
      // if (contentEl) {
      //   contentEl.componentOnReady().then(() => {
      //     writeTask(() => contentEl.scrollToTop(300));
      //   });
      // }
    });
  });
};
