




(() => {
  "use strict";

  const doc = document;
  const win = window;

  const Site = win.AutoGlassSite || {};

  const qs =
    Site.qs ||
    ((selector, scope = doc) =>
      scope ? scope.querySelector(selector) : null);

  const qsa =
    Site.qsa ||
    ((selector, scope = doc) =>
      scope ? [...scope.querySelectorAll(selector)] : []);

  const reduceMotion = win.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  



  function hasSwiper() {
    return typeof win.Swiper === "function";
  }

  function slideCount(element) {
    if (!element) return 0;

    return qsa(
      ".swiper-wrapper > .swiper-slide",
      element
    ).length;
  }

  function refreshMotion() {
    if (
      typeof Site.refreshScrollTrigger ===
      "function"
    ) {
      Site.refreshScrollTrigger();
    }
  }

  function isInitialized(element, key) {
    return element?.dataset?.[key] === "true";
  }

  function markInitialized(element, key) {
    if (element?.dataset) {
      element.dataset[key] = "true";
    }
  }

  function shouldLoopSlides(count, maxSlidesPerView) {
    return count > Math.ceil(maxSlidesPerView * 2);
  }

  function initSwiperOnce(element, options) {
    if (!element || !hasSwiper()) return null;

    if (element.swiper) {
      return element.swiper;
    }

    if (isInitialized(element, "swiperInitialized")) {
      return null;
    }

    markInitialized(element, "swiperInitialized");

    return new win.Swiper(element, options);
  }


  



  function initServiceHero() {
    const hero = qs(".service-hero");

    if (
      !hero ||
      reduceMotion ||
      !win.gsap
    ) {
      return;
    }

    if (isInitialized(hero, "heroMotionInitialized")) return;

    markInitialized(hero, "heroMotionInitialized");

    const topline = qs(
      ".service-hero__topline",
      hero
    );

    const titleParts = qsa(
      ".service-hero__title > span",
      hero
    );

    const description = qs(
      ".service-hero__description",
      hero
    );

    const meta = qsa(
      ".service-hero__meta-item",
      hero
    );

    const media = qs(
      ".service-hero__media img",
      hero
    );

    const timeline = win.gsap.timeline({
      delay: 0.15,
      defaults: {
        ease: "power4.out"
      }
    });

    if (media) {
      timeline.fromTo(
        media,
        {
          scale: 1.12
        },
        {
          scale: 1.06,
          duration: 1.45
        },
        0
      );
    }

    if (topline) {
      timeline.fromTo(
        topline,
        {
          y: 16,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.55
        },
        0.12
      );
    }

    if (titleParts.length) {
      titleParts.forEach((line) => {
        line.style.overflow = "hidden";
      });

      timeline.fromTo(
        titleParts,
        {
          yPercent: 110
        },
        {
          yPercent: 0,
          duration: 0.95,
          stagger: 0.08
        },
        0.2
      );
    }

    if (description) {
      timeline.fromTo(
        description,
        {
          y: 20,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.65
        },
        0.56
      );
    }

    if (meta.length) {
      timeline.fromTo(
        meta,
        {
          y: 17,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.07
        },
        0.62
      );
    }
  }


  



  function initServiceMarquee() {
    const sections = qsa(
      ".service-marquee"
    );

    if (!sections.length) return;

    sections.forEach((section) => {
      if (isInitialized(section, "marqueeInitialized")) return;

      const track = qs(
        ".service-marquee__track",
        section
      );

      if (!track) return;

      let groups = qsa(
        ".service-marquee__group",
        track
      );

      if (!groups.length) return;

      markInitialized(section, "marqueeInitialized");

      if (groups.length === 1) {
        const clone =
          groups[0].cloneNode(true);

        clone.setAttribute(
          "aria-hidden",
          "true"
        );

        track.appendChild(clone);

        groups = qsa(
          ".service-marquee__group",
          track
        );
      }

      if (reduceMotion) return;

      let x = 0;
      let previous =
        performance.now();

      let paused = false;
      let inView = true;
      let pageVisible = !doc.hidden;
      let frameId = 0;
      let groupWidth = 0;

      const speed = 40;

      const measure = () => {
        groupWidth =
          groups[0]?.offsetWidth || 0;
      };

      const shouldRun = () =>
        !paused && inView && pageVisible;

      const frame = (time) => {
        const delta = Math.min(
          (time - previous) / 1000,
          0.05
        );

        previous = time;

        if (shouldRun()) {
          x -= speed * delta;

          if (
            groupWidth > 0 &&
            Math.abs(x) >= groupWidth
          ) {
            x += groupWidth;
          }

          track.style.transform =
            `translate3d(${x}px,0,0)`;
        }

        frameId = requestAnimationFrame(frame);
      };

      section.addEventListener(
        "mouseenter",
        () => {
          paused = true;
        }
      );

      section.addEventListener(
        "mouseleave",
        () => {
          paused = false;
        }
      );

      doc.addEventListener(
        "visibilitychange",
        () => {
          pageVisible = !doc.hidden;
          previous = performance.now();
        }
      );

      win.addEventListener(
        "resize",
        measure,
        {
          passive: true
        }
      );

      if ("IntersectionObserver" in win) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            inView =
              entry?.isIntersecting ?? true;
            previous = performance.now();
          },
          {
            rootMargin: "160px 0px"
          }
        );

        observer.observe(section);
      }

      measure();

      frameId = requestAnimationFrame(frame);
    });
  }


  



  function initServiceParallax() {
    if (
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    if (isInitialized(doc.body, "serviceParallaxInitialized")) return;

    markInitialized(doc.body, "serviceParallaxInitialized");

    const parallaxItems = [
      {
        selector:
          ".service-feature__media img",
        trigger:
          ".service-feature",
        from: -4,
        to: 4
      },
      {
        selector:
          ".service-cta__media img",
        trigger:
          ".service-cta",
        from: -5,
        to: 5
      }
    ];

    parallaxItems.forEach(
      ({
        selector,
        trigger,
        from,
        to
      }) => {
        const image =
          qs(selector);

        const section =
          qs(trigger);

        if (!image || !section) return;

        win.gsap.fromTo(
          image,
          {
            yPercent: from
          },
          {
            yPercent: to,
            ease: "none",

            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8
            }
          }
        );
      }
    );
  }


  



  function initOverviewMotion() {
    const section = qs(
      ".service-overview"
    );

    if (
      !section ||
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    if (isInitialized(section, "overviewMotionInitialized")) return;

    markInitialized(section, "overviewMotionInitialized");

    const title = qs(
      ".service-overview__title",
      section
    );

    const copy = qsa(
      ".service-overview__copy p",
      section
    );

    const stats = qsa(
      ".service-stat",
      section
    );

    if (title) {
      win.gsap.fromTo(
        title,
        {
          y: 30,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",

          scrollTrigger: {
            trigger: title,
            start: "top 86%",
            once: true
          }
        }
      );
    }

    if (copy.length) {
      win.gsap.fromTo(
        copy,
        {
          y: 22,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",

          scrollTrigger: {
            trigger: copy[0],
            start: "top 87%",
            once: true
          }
        }
      );
    }

    if (stats.length) {
      win.gsap.fromTo(
        stats,
        {
          y: 24,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.08,
          ease: "power3.out",

          scrollTrigger: {
            trigger: stats[0],
            start: "top 88%",
            once: true
          }
        }
      );
    }
  }


  



  function initTypeCardsMotion() {
    const cards = qsa(
      ".service-type-card"
    );

    if (
      !cards.length ||
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    const section =
      cards[0].closest(".service-types");

    if (isInitialized(section, "typeCardsMotionInitialized")) return;

    markInitialized(section, "typeCardsMotionInitialized");

    win.gsap.fromTo(
      cards,
      {
        y: 28,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.72,
        stagger: 0.08,
        ease: "power3.out",

        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true
        }
      }
    );
  }


  



  function initBlueprint() {
    const section = qs(
      ".service-blueprint"
    );

    if (!section) return;

    if (isInitialized(section, "blueprintInitialized")) return;

    const markers = qsa(
      ".service-blueprint__marker",
      section
    );

    const panel = qs(
      ".service-blueprint__panel",
      section
    );

    if (!markers.length || !panel) {
      return;
    }

    markInitialized(section, "blueprintInitialized");

    const label = qs(
      ".service-blueprint__panel-label",
      panel
    );

    const title = qs(
      ".service-blueprint__panel-title",
      panel
    );

    const text = qs(
      ".service-blueprint__panel-text",
      panel
    );

    function changeContent(marker) {
      markers.forEach((item) => {
        const active =
          item === marker;

        item.classList.toggle(
          "is-active",
          active
        );

        item.setAttribute(
          "aria-expanded",
          active ? "true" : "false"
        );
      });

      const data = marker.dataset;

      const update = () => {
        if (
          label &&
          data.label
        ) {
          label.textContent =
            data.label;
        }

        if (
          title &&
          data.title
        ) {
          title.textContent =
            data.title;
        }

        if (
          text &&
          data.text
        ) {
          text.textContent =
            data.text;
        }
      };

      if (
        reduceMotion ||
        !win.gsap
      ) {
        update();
        return;
      }

      win.gsap.killTweensOf(panel);

      win.gsap.to(panel, {
        y: 8,
        opacity: 0,
        duration: 0.16,

        onComplete() {
          update();

          win.gsap.to(panel, {
            y: 0,
            opacity: 1,
            duration: 0.34,
            ease: "power3.out"
          });
        }
      });
    }

    markers.forEach((marker) => {
      marker.addEventListener(
        "click",
        () => {
          changeContent(marker);
        }
      );
    });

    const initial =
      markers.find((marker) =>
        marker.classList.contains(
          "is-active"
        )
      ) || markers[0];

    changeContent(initial);


     

    const image = qs(
      ".service-blueprint__image img",
      section
    );

    if (
      image &&
      !reduceMotion &&
      win.gsap &&
      win.ScrollTrigger
    ) {
      win.gsap.fromTo(
        image,
        {
          scale: 1.055,
          yPercent: -2
        },
        {
          scale: 1,
          yPercent: 2,
          ease: "none",

          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8
          }
        }
      );
    }
  }


  



  function initServiceHotspots() {
    const sections = qsa(
      ".service-hotspots"
    );

    sections.forEach((section) => {
      if (isInitialized(section, "hotspotsInitialized")) return;

      const items = qsa(
        "[data-hotspot-item]",
        section
      );

      const markers = qsa(
        "[data-hotspot-marker]",
        section
      );

      const lines = qsa(
        "[data-hotspot-line]",
        section
      );

      if (!items.length || !markers.length) return;

      markInitialized(section, "hotspotsInitialized");

      function activate(key) {
        if (!key) return;

        items.forEach((item) => {
          const active =
            item.dataset.hotspotItem === key;

          item.classList.toggle(
            "is-active",
            active
          );

          item.setAttribute(
            "aria-pressed",
            active ? "true" : "false"
          );
        });

        markers.forEach((marker) => {
          const active =
            marker.dataset.hotspotMarker === key;

          marker.classList.toggle(
            "is-active",
            active
          );

          marker.setAttribute(
            "aria-pressed",
            active ? "true" : "false"
          );
        });

        lines.forEach((line) => {
          line.classList.toggle(
            "is-active",
            line.dataset.hotspotLine === key
          );
        });
      }

      function bind(element, key) {
        element.addEventListener(
          "pointerenter",
          () => {
            activate(key);
          }
        );

        element.addEventListener(
          "focus",
          () => {
            activate(key);
          }
        );

        element.addEventListener(
          "click",
          () => {
            activate(key);
          }
        );
      }

      items.forEach((item) => {
        bind(
          item,
          item.dataset.hotspotItem
        );
      });

      markers.forEach((marker) => {
        bind(
          marker,
          marker.dataset.hotspotMarker
        );
      });

      const initial =
        items.find((item) =>
          item.classList.contains(
            "is-active"
          )
        ) || items[0];

      activate(
        initial.dataset.hotspotItem
      );
    });
  }


  


  function initProcessSwiper() {
    const section = qs(
      ".service-process"
    );

    const swiperElement = qs(
      ".service-process__swiper",
      section
    );

    if (
      !section ||
      !swiperElement ||
      !hasSwiper()
    ) {
      return;
    }

    const count =
      slideCount(swiperElement);

    if (!count) return;

    initSwiperOnce(
      swiperElement,
      {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 18,
        speed: 760,

        grabCursor: true,
        simulateTouch: true,
        watchOverflow: true,

        loop: true,

        navigation: {
          nextEl: qs(
            ".service-process__next",
            section
          ),

          prevEl: qs(
            ".service-process__prev",
            section
          )
        },

        keyboard: {
          enabled: true
        },

        breakpoints: {
          680: {
            slidesPerView: 1.4,
            spaceBetween: 18
          },

          900: {
            slidesPerView: 2,
            spaceBetween: 20
          },

          1280: {
            slidesPerView: 3,
            spaceBetween: 22
          }
        }
      }
    );
  }


  



  function initDetailTabs() {
    const sections = qsa(
      ".service-detail"
    );

    sections.forEach((section) => {
      if (isInitialized(section, "tabsInitialized")) return;

      const tabs = qsa(
        ".service-detail__tab",
        section
      );

      const panels = qsa(
        ".service-detail__panel",
        section
      );

      if (
        !tabs.length ||
        !panels.length
      ) {
        return;
      }

      markInitialized(section, "tabsInitialized");

      const card = qs(
        ".service-detail__card",
        section
      );

      const cardTitle = qs(
        ".service-detail__card-title",
        card
      );

      const cardText = qs(
        ".service-detail__card-text",
        card
      );

      function activate(tab) {
        const target =
          tab.dataset.target;

        if (!target) return;

        tabs.forEach((item) => {
          const active =
            item === tab;

          item.classList.toggle(
            "is-active",
            active
          );

          item.setAttribute(
            "aria-selected",
            active
              ? "true"
              : "false"
          );

          item.setAttribute(
            "tabindex",
            active
              ? "0"
              : "-1"
          );
        });

        panels.forEach((panel) => {
          const active =
            panel.id === target;

          panel.classList.toggle(
            "is-active",
            active
          );

          panel.setAttribute(
            "aria-hidden",
            active
              ? "false"
              : "true"
          );
        });

        if (
          cardTitle &&
          tab.dataset.title
        ) {
          cardTitle.textContent =
            tab.dataset.title;
        }

        if (
          cardText &&
          tab.dataset.text
        ) {
          cardText.textContent =
            tab.dataset.text;
        }

        refreshMotion();
      }

      tabs.forEach(
        (tab, index) => {
          tab.addEventListener(
            "click",
            () => {
              activate(tab);
            }
          );

          tab.addEventListener(
            "keydown",
            (event) => {
              if (
                ![
                  "ArrowUp",
                  "ArrowDown",
                  "ArrowLeft",
                  "ArrowRight"
                ].includes(event.key)
              ) {
                return;
              }

              event.preventDefault();

              const direction =
                event.key ===
                  "ArrowDown" ||
                event.key ===
                  "ArrowRight"
                  ? 1
                  : -1;

              const nextIndex =
                (
                  index +
                  direction +
                  tabs.length
                ) % tabs.length;

              tabs[nextIndex].focus();

              activate(
                tabs[nextIndex]
              );
            }
          );
        }
      );

      const initial =
        tabs.find((tab) =>
          tab.classList.contains(
            "is-active"
          )
        ) || tabs[0];

      activate(initial);
    });
  }


  



  function initBenefitsMotion() {
    const section = qs(
      ".service-benefits"
    );

    if (!section) return;

    const cards = qsa(
      ".service-benefit",
      section
    );

    if (
      !cards.length ||
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    if (isInitialized(section, "benefitsMotionInitialized")) return;

    markInitialized(section, "benefitsMotionInitialized");

    win.gsap.fromTo(
      cards,
      {
        y: 26,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.075,
        ease: "power3.out",

        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true
        }
      }
    );
  }


  



  function initGallerySwiper() {
    const section = qs(
      ".service-gallery"
    );

    const swiperElement = qs(
      ".service-gallery__swiper",
      section
    );

    if (
      !section ||
      !swiperElement ||
      !hasSwiper()
    ) {
      return;
    }

    const count =
      slideCount(swiperElement);

    if (!count) return;

    initSwiperOnce(
      swiperElement,
      {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 18,
        speed: 780,

        grabCursor: true,
        simulateTouch: true,
        watchOverflow: true,

        loop: true,

        navigation: {
          nextEl: qs(
            ".service-gallery__next",
            section
          ),

          prevEl: qs(
            ".service-gallery__prev",
            section
          )
        },

        keyboard: {
          enabled: true
        },

        breakpoints: {
          680: {
            slidesPerView: 1.4
          },

          900: {
            slidesPerView: 2,
            spaceBetween: 20
          },

          1280: {
            slidesPerView: 2.45,
            spaceBetween: 22
          }
        }
      }
    );
  }


  



  function initServiceFaq() {
    const sections = qsa(
      ".service-faq"
    );

    sections.forEach((section) => {
      if (isInitialized(section, "faqInitialized")) return;

      const items = qsa(
        ".service-faq__item",
        section
      );

      if (!items.length) return;

      markInitialized(section, "faqInitialized");

      function closeItem(item) {
        const button = qs(
          ".service-faq__button",
          item
        );

        item.classList.remove(
          "is-open"
        );

        button?.setAttribute(
          "aria-expanded",
          "false"
        );
      }

      function openItem(item) {
        const button = qs(
          ".service-faq__button",
          item
        );

        items.forEach((other) => {
          if (other !== item) {
            closeItem(other);
          }
        });

        item.classList.add(
          "is-open"
        );

        button?.setAttribute(
          "aria-expanded",
          "true"
        );

        win.setTimeout(
          refreshMotion,
          500
        );
      }

      items.forEach((item) => {
        const button = qs(
          ".service-faq__button",
          item
        );

        if (!button) return;

        button.addEventListener(
          "click",
          () => {
            if (
              item.classList.contains(
                "is-open"
              )
            ) {
              closeItem(item);
            } else {
              openItem(item);
            }
          }
        );
      });
    });
  }


  



  function initFeatureMotion() {
    const section = qs(
      ".service-feature"
    );

    if (
      !section ||
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    if (isInitialized(section, "featureMotionInitialized")) return;

    markInitialized(section, "featureMotionInitialized");

    const content = qs(
      ".service-feature__content",
      section
    );

    const items = qsa(
      ".service-feature__item",
      section
    );

    if (content) {
      win.gsap.fromTo(
        content,
        {
          x: 30,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true
          }
        }
      );
    }

    if (items.length) {
      win.gsap.fromTo(
        items,
        {
          x: 18,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.07,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true
          }
        }
      );
    }
  }


  



  function initCtaMotion() {
    const section = qs(
      ".service-cta"
    );

    if (
      !section ||
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    if (isInitialized(section, "ctaMotionInitialized")) return;

    markInitialized(section, "ctaMotionInitialized");

    const title = qs(
      ".service-cta__title",
      section
    );

    const text = qs(
      ".service-cta__text",
      section
    );

    const button = qs(
      ".btn",
      section
    );

    const elements = [
      title,
      text,
      button
    ].filter(Boolean);

    if (!elements.length) return;

    win.gsap.fromTo(
      elements,
      {
        y: 28,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.1,
        ease: "power3.out",

        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true
        }
      }
    );
  }


  



  function initRelatedMotion() {
    const cards = qsa(
      ".related-service-card"
    );

    if (
      !cards.length ||
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    const section =
      cards[0].closest(
        ".related-services"
      );

    if (isInitialized(section, "relatedMotionInitialized")) return;

    markInitialized(section, "relatedMotionInitialized");

    win.gsap.fromTo(
      cards,
      {
        y: 24,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.72,
        stagger: 0.08,
        ease: "power3.out",

        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          once: true
        }
      }
    );
  }


  



  function safeInit(callback) {
    if (typeof callback !== "function") return;

    try {
      callback();
    } catch (error) {
      win.console?.warn?.(
        "AutoGlass service init failed:",
        error
      );
    }
  }



  function init() {
    [
      initServiceHero,
      initServiceMarquee,
      initServiceParallax,
      initOverviewMotion,
      initFeatureMotion,
      initTypeCardsMotion,
      initBlueprint,
      initServiceHotspots,
      initProcessSwiper,
      initDetailTabs,
      initBenefitsMotion,
      initGallerySwiper,
      initServiceFaq,
      initCtaMotion,
      initRelatedMotion
    ].forEach(safeInit);

    win.setTimeout(
      refreshMotion,
      250
    );
  }


  if (
    doc.readyState === "loading"
  ) {
    doc.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }

})();
