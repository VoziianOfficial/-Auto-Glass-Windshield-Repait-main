(() => {
  "use strict";

  const doc = document;

  function initShowcase(section) {
    const cards = [...section.querySelectorAll("[data-showcase-card]")];
    const images = [...section.querySelectorAll("[data-showcase-image]")];

    if (!cards.length || !images.length) return;

    let activeIndex = 0;

    const setActive = (nextIndex) => {
      if (
        nextIndex === activeIndex ||
        nextIndex < 0 ||
        nextIndex >= cards.length
      ) {
        return;
      }

      activeIndex = nextIndex;

      cards.forEach((card, index) => {
        const isActive = index === activeIndex;

        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-pressed", String(isActive));
      });

      images.forEach((image, index) => {
        image.classList.toggle("is-active", index === activeIndex);
      });
    };

    cards.forEach((card, index) => {
      const activate = () => setActive(index);

      card.addEventListener("mouseenter", activate);
      card.addEventListener("focus", activate);
      card.addEventListener("click", activate);
    });
  }

  function init() {
    [...doc.querySelectorAll("[data-showcase]")].forEach(initShowcase);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }
})();
