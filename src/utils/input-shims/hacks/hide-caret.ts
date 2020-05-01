import { isFocused, relocateInput } from "./common";

export const enableHideCaretOnScroll = (
  componentEl: HTMLElement,
  inputEl: HTMLInputElement | HTMLTextAreaElement | undefined,
  // scrollEl: HTMLWlContentElement | undefined
  scrollEl: HTMLElement | undefined
) => {
  if (!scrollEl || !inputEl) {
    return () => {
      return;
    };
  }

  const scrollHideCaret = (shouldHideCaret: boolean) => {
    if (isFocused(inputEl)) {
      relocateInput(componentEl, inputEl, shouldHideCaret);
    }
  };

  const onBlur = () => relocateInput(componentEl, inputEl, false);
  const hideCaret = () => scrollHideCaret(true);
  const showCaret = () => scrollHideCaret(false);

  scrollEl.addEventListener("wlScrollStart", hideCaret);
  scrollEl.addEventListener("wlScrollEnd", showCaret);
  inputEl.addEventListener("blur", onBlur);

  return () => {
    scrollEl.removeEventListener("wlScrollStart", hideCaret);
    scrollEl.removeEventListener("wlScrollEnd", showCaret);
    inputEl.addEventListener("wlBlur", onBlur);
  };
};
