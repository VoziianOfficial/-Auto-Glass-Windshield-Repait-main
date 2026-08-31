




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


  



  function initServiceHero() {
    const hero = qs(".service-hero");

    if (
      !hero ||
      reduceMotion ||
      !win.gsap
    ) {
      return;
    }

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

      const speed = 40;

      const frame = (time) => {
        const delta = Math.min(
          (time - previous) / 1000,
          0.05
        );

        previous = time;

        if (!paused) {
          x -= speed * delta;

          const width =
            groups[0]?.offsetWidth || 0;

          if (
            width > 0 &&
            Math.abs(x) >= width
          ) {
            x += width;
          }

          track.style.transform =
            `translate3d(${x}px,0,0)`;
        }

        requestAnimationFrame(frame);
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

      requestAnimationFrame(frame);
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

    const parallaxItems = [
      {
        selector:
          ".service-hero__media img",
        trigger:
          ".service-hero",
        from: -2,
        to: 4
      },
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
          trigger: cards[0]
            .closest(".service-types"),
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

    new win.Swiper(
      swiperElement,
      {
        slidesPerView: 1,
        spaceBetween: 18,
        speed: 760,

        grabCursor: true,
        watchOverflow: true,

        loop: count >= 6,
        rewind: count < 6,

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

    new win.Swiper(
      swiperElement,
      {
        slidesPerView: 1,
        spaceBetween: 18,
        speed: 780,

        grabCursor: true,
        watchOverflow: true,

        loop: count >= 5,
        rewind: count < 5,

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
      const items = qsa(
        ".service-faq__item",
        section
      );

      if (!items.length) return;

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
          trigger:
            cards[0].closest(
              ".related-services"
            ),
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
