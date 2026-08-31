




(() => {
  "use strict";

  const doc = document;
  const win = window;

  const Site = win.AutoGlassSite || {};

  const qs = Site.qs || ((selector, scope = doc) =>
    scope ? scope.querySelector(selector) : null);

  const qsa = Site.qsa || ((selector, scope = doc) =>
    scope ? [...scope.querySelectorAll(selector)] : []);

  const reduceMotion = win.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  



  function hasSwiper() {
    return typeof win.Swiper === "function";
  }

  function getSlideCount(element) {
    if (!element) return 0;

    return qsa(
      ".swiper-wrapper > .swiper-slide",
      element
    ).length;
  }

  function refreshMotion() {
    if (typeof Site.refreshScrollTrigger === "function") {
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


  



  function initHeroSwiper() {
    const section = qs(".home-hero");
    const element = qs(".home-hero__swiper", section);

    if (!section || !element || !hasSwiper()) return;

    if (isInitialized(section, "heroSwiperInitialized")) return;

    const slides = qsa(
      ".home-hero__slide",
      element
    );

    if (!slides.length) return;

    markInitialized(section, "heroSwiperInitialized");

    const next = qs(
      ".home-hero__arrow--next",
      section
    );

    const prev = qs(
      ".home-hero__arrow--prev",
      section
    );

    const current = qs(
      ".home-hero__slide-current",
      section
    );

    const total = qs(
      ".home-hero__slide-total",
      section
    );

    const progressBar = qs(
      ".home-hero__progress-bar",
      section
    );

    const duration = 6500;

    if (total) {
      total.textContent = String(
        slides.length
      ).padStart(2, "0");
    }

    let progressTween = null;

    const animateProgress = () => {
      if (!progressBar) return;

      if (
        reduceMotion ||
        !win.gsap
      ) {
        progressBar.style.transform = "scaleX(1)";
        return;
      }

      progressTween?.kill();

      win.gsap.set(progressBar, {
        scaleX: 0,
        transformOrigin: "left center"
      });

      progressTween = win.gsap.to(
        progressBar,
        {
          scaleX: 1,
          duration: duration / 1000,
          ease: "none"
        }
      );
    };

    const animateActiveSlide = (swiper) => {
      const slide = swiper.slides[
        swiper.activeIndex
      ];

      if (!slide) return;

      const small = qs(
        ".home-hero__small",
        slide
      );

      const lines = qsa(
        ".home-hero__title-line > span",
        slide
      );

      const description = qs(
        ".home-hero__description",
        slide
      );

      const button = qs(
        ".btn",
        slide
      );

      if (
        reduceMotion ||
        !win.gsap
      ) {
        return;
      }

      win.gsap.killTweensOf([
        small,
        ...lines,
        description,
        button
      ].filter(Boolean));

      const timeline = win.gsap.timeline({
        defaults: {
          ease: "power4.out"
        }
      });

      if (small) {
        timeline.fromTo(
          small,
          {
            y: 18,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.55
          }
        );
      }

      if (lines.length) {
        timeline.fromTo(
          lines,
          {
            yPercent: 110
          },
          {
            yPercent: 0,
            duration: 0.9,
            stagger: 0.09
          },
          "-=0.28"
        );
      }

      const bottomElements = [
        description,
        button
      ].filter(Boolean);

      if (bottomElements.length) {
        timeline.fromTo(
          bottomElements,
          {
            y: 20,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.08
          },
          "-=0.5"
        );
      }
    };

    const updateCounter = (swiper) => {
      if (!current) return;

      current.textContent = String(
        swiper.realIndex + 1
      ).padStart(2, "0");
    };

    const swiper = initSwiperOnce(
      element,
      {
        slidesPerView: 1,
        speed: 1100,

        loop: slides.length > 1,

        effect: "fade",

        fadeEffect: {
          crossFade: true
        },

        allowTouchMove: true,

        grabCursor: true,

        autoplay: reduceMotion
          ? false
          : {
              delay: duration,
              disableOnInteraction: false,
              pauseOnMouseEnter: false
            },

        navigation: {
          nextEl: next,
          prevEl: prev
        },

        keyboard: {
          enabled: true
        },

        a11y: {
          enabled: true
        },

        on: {
          init(swiperInstance) {
            updateCounter(swiperInstance);
            animateActiveSlide(swiperInstance);
            animateProgress();
          },

          slideChangeTransitionStart(swiperInstance) {
            updateCounter(swiperInstance);
            animateProgress();
          },

          slideChangeTransitionEnd(swiperInstance) {
            animateActiveSlide(swiperInstance);
          },

          autoplayPause() {
            progressTween?.pause();
          },

          autoplayResume() {
            progressTween?.resume();
          }
        }
      }
    );

    if (!swiper) return;

    section.addEventListener(
      "mouseenter",
      () => {
        if (
          swiper.autoplay &&
          !reduceMotion
        ) {
          swiper.autoplay.pause();
        }
      }
    );

    section.addEventListener(
      "mouseleave",
      () => {
        if (
          swiper.autoplay &&
          !reduceMotion
        ) {
          swiper.autoplay.resume();
        }
      }
    );
  }


  



  function initMarquees() {
    const marquees = qsa(
      ".home-marquee"
    );

    if (!marquees.length) return;

    marquees.forEach((section) => {
      if (isInitialized(section, "marqueeInitialized")) return;

      const track = qs(
        ".home-marquee__track",
        section
      );

      let groups = qsa(
        ".home-marquee__group",
        track
      );

      if (!track || !groups.length) return;

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
          ".home-marquee__group",
          track
        );
      }

      if (reduceMotion) return;

      let position = 0;
      let lastTime = performance.now();
      let frameId = 0;
      let paused = false;
      let inView = true;
      let pageVisible = !doc.hidden;
      let groupWidth = 0;

      const speed = 42;

      const measure = () => {
        groupWidth = groups[0]?.offsetWidth || 0;
      };

      const shouldRun = () =>
        !paused && inView && pageVisible;

      const animate = (time) => {
        const delta =
          Math.min(
            (time - lastTime) / 1000,
            0.05
          );

        lastTime = time;

        if (shouldRun()) {
          position -= speed * delta;

          if (
            groupWidth > 0 &&
            Math.abs(position) >= groupWidth
          ) {
            position += groupWidth;
          }

          track.style.transform =
            `translate3d(${position}px, 0, 0)`;
        }

        frameId = requestAnimationFrame(animate);
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
          lastTime = performance.now();
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
            lastTime = performance.now();
          },
          {
            rootMargin: "160px 0px"
          }
        );

        observer.observe(section);
      }

      measure();

      frameId = requestAnimationFrame(
        animate
      );
    });
  }


  



  function initServicesSwiper() {
    const section = qs(
      ".home-services"
    );

    const element = qs(
      ".home-services__swiper",
      section
    );

    if (!section || !element || !hasSwiper()) return;

    const count =
      getSlideCount(element);

    if (!count) return;

    const next = qs(
      ".home-services__next",
      section
    );

    const prev = qs(
      ".home-services__prev",
      section
    );

    const useLoop = shouldLoopSlides(
      count,
      2.35
    );

    initSwiperOnce(element, {
      speed: 760,

      spaceBetween: 20,

      slidesPerView: 1,

      grabCursor: true,

      watchOverflow: true,

      





      loop: useLoop,
      rewind: !useLoop,

      navigation: {
        nextEl: next,
        prevEl: prev
      },

      breakpoints: {
        640: {
          slidesPerView: 1.35,
          spaceBetween: 18
        },

        900: {
          slidesPerView: 2,
          spaceBetween: 20
        },

        1280: {
          slidesPerView: 2.35,
          spaceBetween: 22
        }
      },

      keyboard: {
        enabled: true
      }
    });
  }


  



  function initBlueprintMarkers() {
    const section = qs(
      ".home-blueprint"
    );

    if (!section) return;

    if (isInitialized(section, "blueprintInitialized")) return;

    const markers = qsa(
      ".blueprint-marker",
      section
    );

    const panel = qs(
      ".home-blueprint__detail",
      section
    );

    if (!markers.length || !panel) return;

    markInitialized(section, "blueprintInitialized");

    const panelLabel = qs(
      ".home-blueprint__detail-label",
      panel
    );

    const panelTitle = qs(
      ".home-blueprint__detail-title",
      panel
    );

    const panelText = qs(
      ".home-blueprint__detail-text",
      panel
    );

    const updatePanel = (marker) => {
      markers.forEach((item) => {
        item.classList.toggle(
          "is-active",
          item === marker
        );

        item.setAttribute(
          "aria-expanded",
          item === marker
            ? "true"
            : "false"
        );
      });

      const {
        label = "",
        title = "",
        text = ""
      } = marker.dataset;

      const applyContent = () => {
        if (panelLabel) {
          panelLabel.textContent =
            label;
        }

        if (panelTitle) {
          panelTitle.textContent =
            title;
        }

        if (panelText) {
          panelText.textContent =
            text;
        }
      };

      if (
        reduceMotion ||
        !win.gsap
      ) {
        applyContent();
        return;
      }

      win.gsap.to(panel, {
        y: 8,
        opacity: 0,
        duration: 0.18,

        onComplete() {
          applyContent();

          win.gsap.to(panel, {
            y: 0,
            opacity: 1,
            duration: 0.38,
            ease: "power3.out"
          });
        }
      });
    };

    markers.forEach((marker) => {
      marker.addEventListener(
        "click",
        () => {
          updatePanel(marker);
        }
      );
    });

    const initial =
      markers.find((marker) =>
        marker.classList.contains(
          "is-active"
        )
      ) || markers[0];

    updatePanel(initial);
  }


  



  function initGlassTechTabs() {
    const section = qs(
      ".glass-tech"
    );

    if (!section) return;

    const tabs = qsa(
      ".glass-tech__tab",
      section
    );

    const panels = qsa(
      ".glass-tech__panel",
      section
    );

    const card = qs(
      ".glass-tech__floating-card",
      section
    );

    if (!tabs.length || !panels.length) return;

    if (isInitialized(section, "tabsInitialized")) return;

    markInitialized(section, "tabsInitialized");

    const cardTitle = qs(
      "h3",
      card
    );

    const cardText = qs(
      "p",
      card
    );

    function activateTab(tab) {
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
          active ? "true" : "false"
        );
      });

      panels.forEach((panel) => {
        panel.classList.toggle(
          "is-active",
          panel.id === target
        );
      });

      if (cardTitle && tab.dataset.title) {
        cardTitle.textContent =
          tab.dataset.title;
      }

      if (cardText && tab.dataset.text) {
        cardText.textContent =
          tab.dataset.text;
      }

      refreshMotion();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener(
        "click",
        () => {
          activateTab(tab);
        }
      );

      tab.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key !== "ArrowDown" &&
            event.key !== "ArrowUp"
          ) {
            return;
          }

          event.preventDefault();

          const direction =
            event.key === "ArrowDown"
              ? 1
              : -1;

          const nextIndex =
            (
              index +
              direction +
              tabs.length
            ) % tabs.length;

          tabs[nextIndex].focus();
          activateTab(
            tabs[nextIndex]
          );
        }
      );
    });

    const initial =
      tabs.find((tab) =>
        tab.classList.contains(
          "is-active"
        )
      ) || tabs[0];

    activateTab(initial);
  }


  



  function initParallax() {
    if (
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    if (isInitialized(doc.body, "homeParallaxInitialized")) return;

    markInitialized(doc.body, "homeParallaxInitialized");

    qsa(
      ".home-parallax__media img"
    ).forEach((image) => {
      const section =
        image.closest(
          ".home-parallax"
        );

      if (!section) return;

      win.gsap.fromTo(
        image,
        {
          yPercent: -5
        },
        {
          yPercent: 5,
          ease: "none",

          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7
          }
        }
      );
    });

    qsa(
      ".home-about__photo-main img"
    ).forEach((image) => {
      const media =
        image.closest(
          ".home-about__media"
        );

      if (!media) return;

      win.gsap.fromTo(
        image,
        {
          yPercent: -3,
          scale: 1.04
        },
        {
          yPercent: 3,
          scale: 1,

          ease: "none",

          scrollTrigger: {
            trigger: media,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8
          }
        }
      );
    });
  }


  



  function initStatementReveal() {
    const text = qs(
      ".home-statement__text"
    );

    if (
      !text ||
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    const words = qsa(
      "[data-reveal-word]",
      text
    );

    if (!words.length) return;

    if (isInitialized(text, "statementInitialized")) return;

    markInitialized(text, "statementInitialized");

    win.gsap.fromTo(
      words,
      {
        opacity: 0.18
      },
      {
        opacity: 1,
        stagger: 0.06,
        ease: "none",

        scrollTrigger: {
          trigger: text,
          start: "top 84%",
          end: "bottom 56%",
          scrub: 0.45
        }
      }
    );
  }


  



  function initGallerySwiper() {
    const section = qs(
      ".home-gallery"
    );

    const element = qs(
      ".home-gallery__swiper",
      section
    );

    if (!section || !element || !hasSwiper()) return;

    const count =
      getSlideCount(element);

    if (!count) return;

    const useLoop = shouldLoopSlides(
      count,
      2.45
    );

    initSwiperOnce(element, {
      speed: 780,

      slidesPerView: 1,

      spaceBetween: 18,

      grabCursor: true,

      watchOverflow: true,

      loop: useLoop,
      rewind: !useLoop,

      navigation: {
        nextEl: qs(
          ".home-gallery__next",
          section
        ),

        prevEl: qs(
          ".home-gallery__prev",
          section
        )
      },

      breakpoints: {
        680: {
          slidesPerView: 1.45,
          spaceBetween: 18
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
    });
  }


  



  function initBeforeAfter() {
    const sliders = qsa(
      ".before-after"
    );

    if (!sliders.length) return;

    sliders.forEach((slider) => {
      if (
        isInitialized(
          slider,
          "beforeAfterInitialized"
        )
      ) {
        return;
      }

      const before = qs(
        ".before-after__before",
        slider
      );

      const handle = qs(
        ".before-after__handle",
        slider
      );

      if (!before || !handle) return;

      markInitialized(
        slider,
        "beforeAfterInitialized"
      );

      let active = false;
      let value = 50;

      const update = (percent) => {
        value = Math.max(
          4,
          Math.min(96, percent)
        );

        const ratio =
          value / 100;

        slider.style.setProperty(
          "--before-position",
          `${value}%`
        );

        slider.style.setProperty(
          "--before-x",
          `${slider.clientWidth * ratio}px`
        );

        slider.setAttribute(
          "aria-valuenow",
          String(Math.round(value))
        );
      };

      const updateFromPointer = (
        clientX
      ) => {
        const rect =
          slider.getBoundingClientRect();

        if (!rect.width) return;

        const percent =
          (
            (clientX - rect.left) /
            rect.width
          ) * 100;

        update(percent);
      };

      win.addEventListener(
        "resize",
        () => {
          update(value);
        },
        {
          passive: true
        }
      );

      slider.addEventListener(
        "pointerdown",
        (event) => {
          active = true;

          slider.classList.add(
            "is-dragging"
          );

          slider.setPointerCapture?.(
            event.pointerId
          );

          updateFromPointer(
            event.clientX
          );
        }
      );

      slider.addEventListener(
        "pointermove",
        (event) => {
          if (!active) return;

          updateFromPointer(
            event.clientX
          );
        }
      );

      slider.addEventListener(
        "pointerup",
        (event) => {
          active = false;

          slider.classList.remove(
            "is-dragging"
          );

          slider.releasePointerCapture?.(
            event.pointerId
          );
        }
      );

      slider.addEventListener(
        "pointercancel",
        (event) => {
          active = false;

          slider.classList.remove(
            "is-dragging"
          );

          slider.releasePointerCapture?.(
            event.pointerId
          );
        }
      );

      slider.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key !== "ArrowLeft" &&
            event.key !== "ArrowRight"
          ) {
            return;
          }

          event.preventDefault();

          update(
            value +
              (
                event.key === "ArrowRight"
                  ? 4
                  : -4
              )
          );
        }
      );

      slider.setAttribute(
        "tabindex",
        "0"
      );

      slider.setAttribute(
        "role",
        "slider"
      );

      slider.setAttribute(
        "aria-label",
        "Compare damaged and repaired windshield"
      );

      slider.setAttribute(
        "aria-valuemin",
        "4"
      );

      slider.setAttribute(
        "aria-valuemax",
        "96"
      );

      update(50);
    });
  }


  



  function initTestimonialsSwiper() {
    const section = qs(
      ".home-testimonials"
    );

    if (!section) return;

    const element = qs(
      ".home-testimonials__swiper",
      section
    );

    if (!element || !hasSwiper()) return;

    const count =
      getSlideCount(element);

    if (!count) return;

    const useLoop = count > 2;

    initSwiperOnce(element, {
      speed: 760,

      slidesPerView: 1,

      spaceBetween: 20,

      autoHeight: false,

      grabCursor: true,

      watchOverflow: true,

      loop: useLoop,
      rewind: !useLoop,

      navigation: {
        nextEl: qs(
          ".home-testimonials__next",
          section
        ),

        prevEl: qs(
          ".home-testimonials__prev",
          section
        )
      },

      pagination: {
        el: qs(
          ".home-testimonials__pagination",
          section
        ),

        clickable: true
      }
    });
  }


  



  function initFaq() {
    const sections = qsa(
      ".home-faq"
    );

    sections.forEach((section) => {
      if (isInitialized(section, "faqInitialized")) return;

      const items = qsa(
        ".faq-item",
        section
      );

      if (!items.length) return;

      markInitialized(section, "faqInitialized");

      const closeItem = (item) => {
        const button = qs(
          ".faq-item__button",
          item
        );

        item.classList.remove(
          "is-open"
        );

        button?.setAttribute(
          "aria-expanded",
          "false"
        );
      };

      const openItem = (item) => {
        const button = qs(
          ".faq-item__button",
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
      };

      items.forEach((item) => {
        const button = qs(
          ".faq-item__button",
          item
        );

        if (!button) return;

        button.addEventListener(
          "click",
          () => {
            const isOpen =
              item.classList.contains(
                "is-open"
              );

            if (isOpen) {
              closeItem(item);
            } else {
              openItem(item);
            }
          }
        );
      });
    });
  }


  



  function initBlueprintMotion() {
    if (
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    const image = qs(
      ".home-blueprint__image img"
    );

    const section = qs(
      ".home-blueprint"
    );

    if (!image || !section) return;

    if (isInitialized(section, "blueprintMotionInitialized")) return;

    markInitialized(section, "blueprintMotionInitialized");

    win.gsap.fromTo(
      image,
      {
        scale: 1.06,
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


  



  function initContactMotion() {
    const section = qs(
      ".home-contact"
    );

    if (
      !section ||
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    if (isInitialized(section, "contactMotionInitialized")) return;

    markInitialized(section, "contactMotionInitialized");

    const content = qs(
      ".home-contact__content",
      section
    );

    const form = qs(
      ".home-contact__form-wrap",
      section
    );

    if (content) {
      win.gsap.fromTo(
        content,
        {
          x: -28,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 76%",
            once: true
          }
        }
      );
    }

    if (form) {
      win.gsap.fromTo(
        form,
        {
          x: 30,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",

          scrollTrigger: {
            trigger: section,
            start: "top 76%",
            once: true
          }
        }
      );
    }
  }


  



  function safeInit(callback) {
    if (typeof callback !== "function") return;

    try {
      callback();
    } catch (error) {
      win.console?.warn?.(
        "AutoGlass page init failed:",
        error
      );
    }
  }



  function init() {
    [
      initHeroSwiper,
      initMarquees,
      initServicesSwiper,
      initBlueprintMarkers,
      initGlassTechTabs,
      initParallax,
      initStatementReveal,
      initGallerySwiper,
      initBeforeAfter,
      initTestimonialsSwiper,
      initFaq,
      initBlueprintMotion,
      initContactMotion
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
