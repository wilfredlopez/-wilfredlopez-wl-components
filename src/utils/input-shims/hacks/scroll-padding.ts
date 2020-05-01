const PADDING_TIMER_KEY = "$wlPaddingTimer";

export const enableScrollPadding = (keyboardHeight: number) => {
  const doc = document;

  const onFocusin = (ev: any) => {
    setScrollPadding(ev.target, keyboardHeight);
  };
  const onFocusout = (ev: any) => {
    setScrollPadding(ev.target, 0);
  };

  doc.addEventListener("focusin", onFocusin);
  doc.addEventListener("focusout", onFocusout);

  return () => {
    doc.removeEventListener("focusin", onFocusin);
    doc.removeEventListener("focusout", onFocusout);
  };
};

const setScrollPadding = (input: HTMLElement, keyboardHeight: number) => {
  if (input.tagName !== "INPUT") {
    return;
  }
  if (input.parentElement && input.parentElement.tagName === "WL-INPUT") {
    return;
  }
  if (
    input.parentElement &&
    input.parentElement.parentElement &&
    input.parentElement.parentElement.tagName === "WL-SEARCHBAR"
  ) {
    return;
  }

  const el = input.closest("wl-content") as HTMLElement;
  if (el === null) {
    return;
  }
  const timer = (el as any)[PADDING_TIMER_KEY];
  if (timer) {
    clearTimeout(timer);
  }

  if (keyboardHeight > 0) {
    el.style.setProperty("--keyboard-offset", `${keyboardHeight}px`);
  } else {
    (el as any)[PADDING_TIMER_KEY] = setTimeout(() => {
      el.style.setProperty("--keyboard-offset", "0px");
    }, 120);
  }
};
