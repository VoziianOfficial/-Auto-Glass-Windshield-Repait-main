(() => {
  "use strict";

  const doc = document;
  const win = window;
  const Site = win.AutoGlassSite || {};

  const qs = Site.qs || ((selector, scope = doc) =>
    scope ? scope.querySelector(selector) : null);

  const qsa = Site.qsa || ((selector, scope = doc) =>
    scope ? [...scope.querySelectorAll(selector)] : []);

  function refreshMotion() {
    if (typeof Site.refreshScrollTrigger === "function") {
      Site.refreshScrollTrigger();
    }
  }

  function initHomeAccordion() {
    qsa("[data-home-accordion]").forEach((accordion) => {
      if (accordion.dataset.homeAccordionInitialized === "true") return;

      const items = qsa(".home-accordion__item", accordion);

      if (!items.length) return;

      accordion.dataset.homeAccordionInitialized = "true";

      const setItemState = (item, isOpen) => {
        const button = qs(".home-accordion__button", item);

        item.classList.toggle("is-open", isOpen);
        button?.setAttribute("aria-expanded", isOpen ? "true" : "false");
      };

      const openItem = (targetItem) => {
        items.forEach((item) => {
          setItemState(item, item === targetItem);
        });

        win.setTimeout(refreshMotion, 560);
      };

      items.forEach((item, index) => {
        const button = qs(".home-accordion__button", item);

        setItemState(item, index === 0);

        if (!button) return;

        button.addEventListener("click", () => {
          const isOpen = item.classList.contains("is-open");

          if (isOpen) {
            setItemState(item, false);
            win.setTimeout(refreshMotion, 560);
            return;
          }

          openItem(item);
        });
      });
    });
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", initHomeAccordion);
  } else {
    initHomeAccordion();
  }
})();
