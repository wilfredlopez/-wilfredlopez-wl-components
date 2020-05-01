import { Animation } from "../animation/animation-interface";
import { createAnimation } from "../animation/animation";
import { TransitionOptions, getWlPageElement } from ".";

const DURATION = 540;

const getClonedElement = (tagName: string): any => {
  return document.querySelector(`${tagName}.wl-cloned-element`) as any;
};

export const shadow = <T extends Element>(el: T): ShadowRoot | T => {
  return el.shadowRoot || el;
};

const getLargeTitle = (refEl: any) => {
  const tabs =
    refEl.tagName === "WL-TABS" ? refEl : refEl.querySelector("wl-tabs");
  const query =
    "wl-header:not(.header-collapse-condense-inactive) wl-title.title-large";

  if (tabs != null) {
    const activeTab = tabs.querySelector(
      "wl-tab:not(.tab-hidden), .wl-page:not(.wl-page-hidden)"
    );
    return activeTab != null ? activeTab.querySelector(query) : null;
  }

  return refEl.querySelector(query);
};

const getBackButton = (refEl: any, backDirection: boolean) => {
  const tabs =
    refEl.tagName === "wl-TABS" ? refEl : refEl.querySelector("wl-tabs");
  let buttonsList = [];

  if (tabs != null) {
    const activeTab = tabs.querySelector(
      "wl-tab:not(.tab-hidden), .wl-page:not(.wl-page-hidden)"
    );
    if (activeTab != null) {
      buttonsList = activeTab.querySelectorAll("wl-buttons");
    }
  } else {
    buttonsList = refEl.querySelectorAll("wl-buttons");
  }

  for (const buttons of buttonsList) {
    const parentHeader = buttons.closest("wl-header");
    const activeHeader =
      parentHeader &&
      !parentHeader.classList.contains("header-collapse-condense-inactive");
    const backButton = buttons.querySelector("wl-back-button");
    const buttonsCollapse = buttons.classList.contains("buttons-collapse");
    const startSlot = buttons.slot === "start" || buttons.slot === "";

    if (
      backButton !== null &&
      startSlot &&
      ((buttonsCollapse && activeHeader && backDirection) || !buttonsCollapse)
    ) {
      return backButton;
    }
  }

  return null;
};

const createLargeTitleTransition = (
  rootAnimation: Animation,
  rtl: boolean,
  backDirection: boolean,
  enteringEl: any,
  leavingEl: any
) => {
  const enteringBackButton = getBackButton(enteringEl, backDirection);
  const leavingLargeTitle = getLargeTitle(leavingEl);

  const enteringLargeTitle = getLargeTitle(enteringEl);
  const leavingBackButton = getBackButton(leavingEl, backDirection);

  const shouldAnimationForward =
    enteringBackButton !== null && leavingLargeTitle !== null && !backDirection;
  const shouldAnimationBackward =
    enteringLargeTitle !== null && leavingBackButton !== null && backDirection;

  if (shouldAnimationForward) {
    const leavingLargeTitleBox = leavingLargeTitle.getBoundingClientRect();
    const enteringBackButtonBox = enteringBackButton.getBoundingClientRect();

    animateLargeTitle(
      rootAnimation,
      rtl,
      backDirection,
      leavingLargeTitle,
      leavingLargeTitleBox,
      enteringBackButtonBox
    );
    animateBackButton(
      rootAnimation,
      rtl,
      backDirection,
      enteringBackButton,
      leavingLargeTitleBox,
      enteringBackButtonBox
    );
  } else if (shouldAnimationBackward) {
    const enteringLargeTitleBox = enteringLargeTitle.getBoundingClientRect();
    const leavingBackButtonBox = leavingBackButton.getBoundingClientRect();

    animateLargeTitle(
      rootAnimation,
      rtl,
      backDirection,
      enteringLargeTitle,
      enteringLargeTitleBox,
      leavingBackButtonBox
    );
    animateBackButton(
      rootAnimation,
      rtl,
      backDirection,
      leavingBackButton,
      enteringLargeTitleBox,
      leavingBackButtonBox
    );
  }

  return {
    forward: shouldAnimationForward,
    backward: shouldAnimationBackward,
  };
};

const animateBackButton = (
  rootAnimation: Animation,
  rtl: boolean,
  backDirection: boolean,
  backButtonEl: any,
  largeTitleBox: DOMRect,
  backButtonBox: DOMRect
) => {
  const BACK_BUTTON_START_OFFSET = rtl
    ? `calc(100% - ${backButtonBox.right + 4}px)`
    : `${backButtonBox.left - 4}px`;
  const START_TEXT_TRANSLATE = rtl ? "7px" : "-7px";
  const END_TEXT_TRANSLATE = rtl ? "-4px" : "4px";

  const WL_TRANSLATE = rtl ? "-4px" : "4px";

  const TEXT_ORIGIN_X = rtl ? "right" : "left";
  const ICON_ORIGIN_X = rtl ? "left" : "right";

  const FORWARD_TEXT_KEYFRAMES = [
    {
      offset: 0,
      opacity: 0,
      transform: `translate3d(${START_TEXT_TRANSLATE}, ${
        largeTitleBox.top - 40
      }px, 0) scale(2.1)`,
    },
    {
      offset: 1,
      opacity: 1,
      transform: `translate3d(${END_TEXT_TRANSLATE}, ${
        backButtonBox.top - 46
      }px, 0) scale(1)`,
    },
  ];
  const BACKWARD_TEXT_KEYFRAMES = [
    {
      offset: 0,
      opacity: 1,
      transform: `translate3d(${END_TEXT_TRANSLATE}, ${
        backButtonBox.top - 46
      }px, 0) scale(1)`,
    },
    { offset: 0.6, opacity: 0 },
    {
      offset: 1,
      opacity: 0,
      transform: `translate3d(${START_TEXT_TRANSLATE}, ${
        largeTitleBox.top - 40
      }px, 0) scale(2.1)`,
    },
  ];
  const TEXT_KEYFRAMES = backDirection
    ? BACKWARD_TEXT_KEYFRAMES
    : FORWARD_TEXT_KEYFRAMES;

  const FORWARD_ICON_KEYFRAMES = [
    {
      offset: 0,
      opacity: 0,
      transform: `translate3d(${WL_TRANSLATE}, ${
        backButtonBox.top - 41
      }px, 0) scale(0.6)`,
    },
    {
      offset: 1,
      opacity: 1,
      transform: `translate3d(${WL_TRANSLATE}, ${
        backButtonBox.top - 46
      }px, 0) scale(1)`,
    },
  ];
  const BACKWARD_ICON_KEYFRAMES = [
    {
      offset: 0,
      opacity: 1,
      transform: `translate3d(${WL_TRANSLATE}, ${
        backButtonBox.top - 46
      }px, 0) scale(1)`,
    },
    {
      offset: 0.2,
      opacity: 0,
      transform: `translate3d(${WL_TRANSLATE}, ${
        backButtonBox.top - 41
      }px, 0) scale(0.6)`,
    },
    {
      offset: 1,
      opacity: 0,
      transform: `translate3d(${WL_TRANSLATE}, ${
        backButtonBox.top - 41
      }px, 0) scale(0.6)`,
    },
  ];
  const ICON_KEYFRAMES = backDirection
    ? BACKWARD_ICON_KEYFRAMES
    : FORWARD_ICON_KEYFRAMES;

  const enteringBackButtonTextAnimation = createAnimation();
  const enteringBackButtonIconAnimation = createAnimation();

  const clonedBackButtonEl = getClonedElement("wl-back-button");

  const backButtonTextEl = shadow(clonedBackButtonEl).querySelector(
    ".button-text"
  );
  const backButtonIconEl = shadow(clonedBackButtonEl).querySelector("wl-icon");

  clonedBackButtonEl.text = backButtonEl.text;
  clonedBackButtonEl.mode = backButtonEl.mode;
  clonedBackButtonEl.icon = backButtonEl.icon;
  clonedBackButtonEl.color = backButtonEl.color;
  clonedBackButtonEl.disabled = backButtonEl.disabled;

  clonedBackButtonEl.style.setProperty("display", "block");
  clonedBackButtonEl.style.setProperty("position", "fixed");

  enteringBackButtonIconAnimation.addElement(backButtonIconEl);
  enteringBackButtonTextAnimation.addElement(backButtonTextEl);

  enteringBackButtonTextAnimation
    .beforeStyles({
      "transform-origin": `${TEXT_ORIGIN_X} center`,
    })
    .beforeAddWrite(() => {
      backButtonEl.style.setProperty("display", "none");
      clonedBackButtonEl.style.setProperty(
        TEXT_ORIGIN_X,
        BACK_BUTTON_START_OFFSET
      );
    })
    .afterAddWrite(() => {
      backButtonEl.style.setProperty("display", "");
      clonedBackButtonEl.style.setProperty("display", "none");
      clonedBackButtonEl.style.removeProperty(TEXT_ORIGIN_X);
    })
    .keyframes(TEXT_KEYFRAMES);

  enteringBackButtonIconAnimation
    .beforeStyles({
      "transform-origin": `${ICON_ORIGIN_X} center`,
    })
    .keyframes(ICON_KEYFRAMES);

  rootAnimation.addAnimation([
    enteringBackButtonTextAnimation,
    enteringBackButtonIconAnimation,
  ]);
};

const animateLargeTitle = (
  rootAnimation: Animation,
  rtl: boolean,
  backDirection: boolean,
  largeTitleEl: any,
  largeTitleBox: DOMRect,
  backButtonBox: DOMRect
) => {
  const TITLE_START_OFFSET = rtl
    ? `calc(100% - ${largeTitleBox.right}px)`
    : `${largeTitleBox.left}px`;
  const START_TRANSLATE = rtl ? "-18px" : "18px";
  const ORIGIN_X = rtl ? "right" : "left";

  const BACKWARDS_KEYFRAMES = [
    {
      offset: 0,
      opacity: 0,
      transform: `translate3d(${START_TRANSLATE}, ${
        backButtonBox.top - 4
      }px, 0) scale(0.49)`,
    },
    { offset: 0.1, opacity: 0 },
    {
      offset: 1,
      opacity: 1,
      transform: `translate3d(0, ${largeTitleBox.top - 2}px, 0) scale(1)`,
    },
  ];
  const FORWARDS_KEYFRAMES = [
    {
      offset: 0,
      opacity: 0.99,
      transform: `translate3d(0, ${largeTitleBox.top - 2}px, 0) scale(1)`,
    },
    { offset: 0.6, opacity: 0 },
    {
      offset: 1,
      opacity: 0,
      transform: `translate3d(${START_TRANSLATE}, ${
        backButtonBox.top - 4
      }px, 0) scale(0.5)`,
    },
  ];

  const KEYFRAMES = backDirection ? BACKWARDS_KEYFRAMES : FORWARDS_KEYFRAMES;

  const clonedTitleEl = getClonedElement("wl-title");
  const clonedLargeTitleAnimation = createAnimation();

  clonedTitleEl.innerText = largeTitleEl.innerText;
  clonedTitleEl.size = largeTitleEl.size;
  clonedTitleEl.color = largeTitleEl.color;

  clonedLargeTitleAnimation.addElement(clonedTitleEl);

  clonedLargeTitleAnimation
    .beforeStyles({
      "transform-origin": `${ORIGIN_X} center`,
      height: "46px",
      display: "",
      position: "relative",
      [ORIGIN_X]: TITLE_START_OFFSET,
    })
    .beforeAddWrite(() => {
      largeTitleEl.style.setProperty("display", "none");
    })
    .afterAddWrite(() => {
      largeTitleEl.style.setProperty("display", "");
      clonedTitleEl.style.setProperty("display", "none");
    })
    .keyframes(KEYFRAMES);

  rootAnimation.addAnimation(clonedLargeTitleAnimation);
};

export const iosTransitionAnimation = (
  navEl: HTMLElement,
  opts: TransitionOptions
): Animation => {
  try {
    const EASING = "cubic-bezier(0.32,0.72,0,1)";
    const OPACITY = "opacity";
    const TRANSFORM = "transform";
    const CENTER = "0%";
    const OFF_OPACITY = 0.8;

    const isRTL = (navEl.ownerDocument as any).dir === "rtl";
    const OFF_RIGHT = isRTL ? "-99.5%" : "99.5%";
    const OFF_LEFT = isRTL ? "33%" : "-33%";

    const enteringEl = opts.enteringEl;
    const leavingEl = opts.leavingEl;

    const backDirection = opts.direction === "back";
    const contentEl = enteringEl.querySelector(":scope > wl-content");
    const headerEls = enteringEl.querySelectorAll(
      ":scope > wl-header > *:not(wl-toolbar), :scope > wl-footer > *"
    );
    const enteringToolBarEls = enteringEl.querySelectorAll(
      ":scope > wl-header > wl-toolbar"
    );

    const rootAnimation = createAnimation();
    const enteringContentAnimation = createAnimation();

    rootAnimation
      .addElement(enteringEl)
      .duration(opts.duration || DURATION)
      .easing(opts.easing || EASING)
      .fill("both")
      .beforeRemoveClass("wl-page-invisible");

    if (leavingEl && navEl) {
      const navDecorAnimation = createAnimation();
      navDecorAnimation.addElement(navEl);
      rootAnimation.addAnimation(navDecorAnimation);
    }

    if (
      !contentEl &&
      enteringToolBarEls.length === 0 &&
      headerEls.length === 0
    ) {
      enteringContentAnimation.addElement(
        enteringEl.querySelector(
          ":scope > .wl-page, :scope > wl-nav, :scope > wl-tabs"
        )!
      ); // REVIEW
    } else {
      enteringContentAnimation.addElement(contentEl!); // REVIEW
      enteringContentAnimation.addElement(headerEls);
    }

    rootAnimation.addAnimation(enteringContentAnimation);

    if (backDirection) {
      enteringContentAnimation
        .beforeClearStyles([OPACITY])
        .fromTo("transform", `translateX(${OFF_LEFT})`, `translateX(${CENTER})`)
        .fromTo(OPACITY, OFF_OPACITY, 1);
    } else {
      // entering content, forward direction
      enteringContentAnimation
        .beforeClearStyles([OPACITY])
        .fromTo(
          "transform",
          `translateX(${OFF_RIGHT})`,
          `translateX(${CENTER})`
        );
    }

    if (contentEl) {
      const enteringTransitionEffectEl = shadow(contentEl).querySelector(
        ".transitwl-effect"
      );
      if (enteringTransitionEffectEl) {
        const enteringTransitionCoverEl = enteringTransitionEffectEl.querySelector(
          ".transitwl-cover"
        );
        const enteringTransitionShadowEl = enteringTransitionEffectEl.querySelector(
          ".transitwl-shadow"
        );

        const enteringTransitionEffect = createAnimation();
        const enteringTransitionCover = createAnimation();
        const enteringTransitionShadow = createAnimation();

        enteringTransitionEffect
          .addElement(enteringTransitionEffectEl)
          .beforeStyles({ opacity: "1", display: "block" })
          .afterStyles({ opacity: "", display: "" });

        enteringTransitionCover
          .addElement(enteringTransitionCoverEl!) // REVIEW
          .beforeClearStyles([OPACITY])
          .fromTo(OPACITY, 0, 0.1);

        enteringTransitionShadow
          .addElement(enteringTransitionShadowEl!) // REVIEW
          .beforeClearStyles([OPACITY])
          .fromTo(OPACITY, 0.03, 0.7);

        enteringTransitionEffect.addAnimation([
          enteringTransitionCover,
          enteringTransitionShadow,
        ]);
        enteringContentAnimation.addAnimation([enteringTransitionEffect]);
      }
    }

    const enteringContentHasLargeTitle = enteringEl.querySelector(
      "wl-header.header-collapse-condense"
    );

    const { forward, backward } = createLargeTitleTransition(
      rootAnimation,
      isRTL,
      backDirection,
      enteringEl,
      leavingEl
    );
    enteringToolBarEls.forEach((enteringToolBarEl) => {
      const enteringToolBar = createAnimation();
      enteringToolBar.addElement(enteringToolBarEl);
      rootAnimation.addAnimation(enteringToolBar);

      const enteringTitle = createAnimation();
      enteringTitle.addElement(enteringToolBarEl.querySelector("wl-title")!); // REVIEW

      const enteringToolBarButtons = createAnimation();
      const buttons = Array.from(
        enteringToolBarEl.querySelectorAll("wl-buttons,[menuToggle]")
      );

      const parentHeader = enteringToolBarEl.closest("wl-header");
      const inactiveHeader =
        parentHeader &&
        parentHeader.classList.contains("header-collapse-condense-inactive");

      let buttonsToAnimate;
      if (backDirection) {
        buttonsToAnimate = buttons.filter((button) => {
          const isCollapseButton = button.classList.contains(
            "buttons-collapse"
          );
          return (isCollapseButton && !inactiveHeader) || !isCollapseButton;
        });
      } else {
        buttonsToAnimate = buttons.filter(
          (button) => !button.classList.contains("buttons-collapse")
        );
      }

      enteringToolBarButtons.addElement(buttonsToAnimate);

      const enteringToolBarItems = createAnimation();
      enteringToolBarItems.addElement(
        enteringToolBarEl.querySelectorAll(
          ":scope > *:not(wl-title):not(wl-buttons):not([menuToggle])"
        )
      );

      const enteringToolBarBg = createAnimation();
      enteringToolBarBg.addElement(
        shadow(enteringToolBarEl).querySelector(".toolbar-background")!
      ); // REVIEW

      const enteringBackButton = createAnimation();
      const backButtonEl = enteringToolBarEl.querySelector("wl-back-button");

      if (backButtonEl) {
        enteringBackButton.addElement(backButtonEl);
      }

      enteringToolBar.addAnimation([
        enteringTitle,
        enteringToolBarButtons,
        enteringToolBarItems,
        enteringToolBarBg,
        enteringBackButton,
      ]);
      enteringToolBarButtons.fromTo(OPACITY, 0.01, 1);
      enteringToolBarItems.fromTo(OPACITY, 0.01, 1);

      if (backDirection) {
        if (!inactiveHeader) {
          enteringTitle
            .fromTo(
              "transform",
              `translateX(${OFF_LEFT})`,
              `translateX(${CENTER})`
            )
            .fromTo(OPACITY, 0.01, 1);
        }

        enteringToolBarItems.fromTo(
          "transform",
          `translateX(${OFF_LEFT})`,
          `translateX(${CENTER})`
        );

        // back direction, entering page has a back button
        enteringBackButton.fromTo(OPACITY, 0.01, 1);
      } else {
        // entering toolbar, forward direction
        if (!enteringContentHasLargeTitle) {
          enteringTitle
            .fromTo(
              "transform",
              `translateX(${OFF_RIGHT})`,
              `translateX(${CENTER})`
            )
            .fromTo(OPACITY, 0.01, 1);
        }

        enteringToolBarItems.fromTo(
          "transform",
          `translateX(${OFF_RIGHT})`,
          `translateX(${CENTER})`
        );
        enteringToolBarBg.beforeClearStyles([OPACITY, "transform"]);

        // const translucentHeader = parentHeader?.translucent;
        const translucentHeader = false;
        if (!translucentHeader) {
          enteringToolBarBg.fromTo(OPACITY, 0.01, 1);
        } else {
          enteringToolBarBg.fromTo(
            "transform",
            isRTL ? "translateX(-100%)" : "translateX(100%)",
            "translateX(0px)"
          );
        }

        // forward direction, entering page has a back button
        if (!forward) {
          enteringBackButton.fromTo(OPACITY, 0.01, 1);
        }

        if (backButtonEl && !forward) {
          const enteringBackBtnText = createAnimation();
          enteringBackBtnText
            .addElement(shadow(backButtonEl).querySelector(".button-text")!) // REVIEW
            .fromTo(
              `transform`,
              isRTL ? "translateX(-100px)" : "translateX(100px)",
              "translateX(0px)"
            );

          enteringToolBar.addAnimation(enteringBackBtnText);
        }
      }
    });

    // setup leaving view
    if (leavingEl) {
      const leavingContent = createAnimation();
      const leavingContentEl = leavingEl.querySelector(":scope > wl-content");
      const leavingToolBarEls = leavingEl.querySelectorAll(
        ":scope > wl-header > wl-toolbar"
      );
      const leavingHeaderEls = leavingEl.querySelectorAll(
        ":scope > wl-header > *:not(wl-toolbar), :scope > wl-footer > *"
      );

      if (
        !leavingContentEl &&
        leavingToolBarEls.length === 0 &&
        leavingHeaderEls.length === 0
      ) {
        leavingContent.addElement(
          leavingEl.querySelector(
            ":scope > .wl-page, :scope > wl-nav, :scope > wl-tabs"
          )!
        ); // REVIEW
      } else {
        leavingContent.addElement(leavingContentEl!); // REVIEW
        leavingContent.addElement(leavingHeaderEls);
      }

      rootAnimation.addAnimation(leavingContent);

      if (backDirection) {
        // leaving content, back direction
        leavingContent
          .beforeClearStyles([OPACITY])
          .fromTo(
            "transform",
            `translateX(${CENTER})`,
            isRTL ? "translateX(-100%)" : "translateX(100%)"
          );

        const leavingPage = getWlPageElement(leavingEl) as HTMLElement;
        rootAnimation.afterAddWrite(() => {
          if (rootAnimation.getDirection() === "normal") {
            leavingPage.style.setProperty("display", "none");
          }
        });
      } else {
        // leaving content, forward direction
        leavingContent
          .fromTo(
            "transform",
            `translateX(${CENTER})`,
            `translateX(${OFF_LEFT})`
          )
          .fromTo(OPACITY, 1, OFF_OPACITY);
      }

      if (leavingContentEl) {
        const leavingTransitionEffectEl = shadow(
          leavingContentEl
        ).querySelector(".transitwl-effect");

        if (leavingTransitionEffectEl) {
          const leavingTransitionCoverEl = leavingTransitionEffectEl.querySelector(
            ".transitwl-cover"
          );
          const leavingTransitionShadowEl = leavingTransitionEffectEl.querySelector(
            ".transitwl-shadow"
          );

          const leavingTransitionEffect = createAnimation();
          const leavingTransitionCover = createAnimation();
          const leavingTransitionShadow = createAnimation();

          leavingTransitionEffect
            .addElement(leavingTransitionEffectEl)
            .beforeStyles({ opacity: "1", display: "block" })
            .afterStyles({ opacity: "", display: "" });

          leavingTransitionCover
            .addElement(leavingTransitionCoverEl!) // REVIEW
            .beforeClearStyles([OPACITY])
            .fromTo(OPACITY, 0.1, 0);

          leavingTransitionShadow
            .addElement(leavingTransitionShadowEl!) // REVIEW
            .beforeClearStyles([OPACITY])
            .fromTo(OPACITY, 0.7, 0.03);

          leavingTransitionEffect.addAnimation([
            leavingTransitionCover,
            leavingTransitionShadow,
          ]);
          leavingContent.addAnimation([leavingTransitionEffect]);
        }
      }

      leavingToolBarEls.forEach((leavingToolBarEl) => {
        const leavingToolBar = createAnimation();
        leavingToolBar.addElement(leavingToolBarEl);

        const leavingTitle = createAnimation();
        leavingTitle.addElement(leavingToolBarEl.querySelector("wl-title")!); // REVIEW

        const leavingToolBarButtons = createAnimation();
        const buttons = leavingToolBarEl.querySelectorAll(
          "wl-buttons,[menuToggle]"
        );

        const parentHeader = leavingToolBarEl.closest("wl-header");
        const inactiveHeader =
          parentHeader &&
          parentHeader.classList.contains("header-collapse-condense-inactive");

        const buttonsToAnimate = Array.from(buttons).filter((button) => {
          const isCollapseButton = button.classList.contains(
            "buttons-collapse"
          );
          return (isCollapseButton && !inactiveHeader) || !isCollapseButton;
        });

        leavingToolBarButtons.addElement(buttonsToAnimate);

        const leavingToolBarItems = createAnimation();
        const leavingToolBarItemEls = leavingToolBarEl.querySelectorAll(
          ":scope > *:not(wl-title):not(wl-buttons):not([menuToggle])"
        );
        if (leavingToolBarItemEls.length > 0) {
          leavingToolBarItems.addElement(leavingToolBarItemEls);
        }

        const leavingToolBarBg = createAnimation();
        leavingToolBarBg.addElement(
          shadow(leavingToolBarEl).querySelector(".toolbar-background")!
        ); // REVIEW

        const leavingBackButton = createAnimation();
        const backButtonEl = leavingToolBarEl.querySelector("wl-back-button");
        if (backButtonEl) {
          leavingBackButton.addElement(backButtonEl);
        }

        leavingToolBar.addAnimation([
          leavingTitle,
          leavingToolBarButtons,
          leavingToolBarItems,
          leavingBackButton,
          leavingToolBarBg,
        ]);
        rootAnimation.addAnimation(leavingToolBar);

        // fade out leaving toolbar items
        leavingBackButton.fromTo(OPACITY, 0.99, 0);

        leavingToolBarButtons.fromTo(OPACITY, 0.99, 0);
        leavingToolBarItems.fromTo(OPACITY, 0.99, 0);

        if (backDirection) {
          if (!inactiveHeader) {
            // leaving toolbar, back direction
            leavingTitle
              .fromTo(
                "transform",
                `translateX(${CENTER})`,
                isRTL ? "translateX(-100%)" : "translateX(100%)"
              )
              .fromTo(OPACITY, 0.99, 0);
          }

          leavingToolBarItems.fromTo(
            "transform",
            `translateX(${CENTER})`,
            isRTL ? "translateX(-100%)" : "translateX(100%)"
          );
          leavingToolBarBg.beforeClearStyles([OPACITY, "transform"]);
          // leaving toolbar, back direction, and there's no entering toolbar
          // should just slide out, no fading out
          const translucentHeader = false;
          if (!translucentHeader) {
            leavingToolBarBg.fromTo(OPACITY, 0.99, 0);
          } else {
            leavingToolBarBg.fromTo(
              "transform",
              "translateX(0px)",
              isRTL ? "translateX(-100%)" : "translateX(100%)"
            );
          }

          if (backButtonEl && !backward) {
            const leavingBackBtnText = createAnimation();
            leavingBackBtnText
              .addElement(shadow(backButtonEl).querySelector(".button-text")!) // REVIEW
              .fromTo(
                "transform",
                `translateX(${CENTER})`,
                `translateX(${(isRTL ? -124 : 124) + "px"})`
              );
            leavingToolBar.addAnimation(leavingBackBtnText);
          }
        } else {
          // leaving toolbar, forward direction
          if (!inactiveHeader) {
            leavingTitle
              .fromTo(
                "transform",
                `translateX(${CENTER})`,
                `translateX(${OFF_LEFT})`
              )
              .fromTo(OPACITY, 0.99, 0)
              .afterClearStyles([TRANSFORM, OPACITY]);
          }

          leavingToolBarItems
            .fromTo(
              "transform",
              `translateX(${CENTER})`,
              `translateX(${OFF_LEFT})`
            )
            .afterClearStyles([TRANSFORM, OPACITY]);

          leavingBackButton.afterClearStyles([OPACITY]);
          leavingTitle.afterClearStyles([OPACITY]);
          leavingToolBarButtons.afterClearStyles([OPACITY]);
        }
      });
    }

    return rootAnimation;
  } catch (err) {
    throw err;
  }
};
