




(() => {
  "use strict";

  const doc = document;
  const win = window;

  const qs = (selector, scope = doc) =>
    scope ? scope.querySelector(selector) : null;

  const qsa = (selector, scope = doc) =>
    scope ? [...scope.querySelectorAll(selector)] : [];

  const prefersReducedMotion = win.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const Config = win.SiteConfig || {};

  let scrollTriggers = [];
  let loaderHidden = false;
  let loaderFallbackTimer = null;
  let scrollLockY = 0;
  let pageScrollLocked = false;


  



  function replaceTokens(value = "") {
    if (typeof value !== "string") return value;

    return value.replace(
      /\{companyName\}/g,
      Config.companyName || ""
    );
  }

  function getCurrentPageKey() {
    return doc.body?.dataset.page || "home";
  }

  function getConfiguredPageTitle() {
    const key = getCurrentPageKey();
    const pageTitles = Config.pageTitles || {};

    const aliases = {
      home: "home",
      repair: "windshieldRepair",
      windshieldRepair: "windshieldRepair",
      replacement: "windshieldReplacement",
      windshieldReplacement: "windshieldReplacement",
      privacy: "privacy",
      terms: "terms",
      cookies: "cookies"
    };

    return pageTitles[aliases[key] || key] || "";
  }

  function getService(key) {
    if (!key) return null;

    return Config.services?.[key] || null;
  }


  



  function applyConfig() {
    const companyName =
      Config.companyName || "Auto Glass";

    const email =
      Config.email || "";

    const disclaimer =
      replaceTokens(Config.disclaimer || "");

    const logo =
      Config.logo || "";

    const favicon =
      Config.favicon || "";

     
    qsa("[data-company-name]").forEach((element) => {
      element.textContent = companyName;
    });

     
    qsa("[data-site-disclaimer]").forEach((element) => {
      element.textContent = disclaimer;
    });

     
    qsa("[data-site-email], [data-site-email-link]").forEach((element) => {
      if (
        element.hasAttribute("data-site-email") &&
        element.children.length === 0
      ) {
        element.textContent = email;
      }

      if (
        element.tagName === "A" &&
        email
      ) {
        element.href = `mailto:${email}`;

        if (element.children.length > 0) {
          element.setAttribute(
            "aria-label",
            `Email ${email}`
          );
        }
      }
    });

     
    qsa("[data-site-logo]").forEach((image) => {
      if (!logo) return;

      image.src = logo;

      image.alt = `${companyName} logo`;
    });

     
    qsa("[data-brand-link]").forEach((link) => {
      link.setAttribute(
        "aria-label",
        `${companyName} home`
      );
    });

     
    qsa("[data-current-year]").forEach((element) => {
      element.textContent =
        new Date().getFullYear().toString();
    });

     
    const pageKey = getCurrentPageKey();
    const pageTitle = getConfiguredPageTitle();
    const separator =
      Config.titleSeparator || " | ";

    if (pageKey === "home" && Config.browserTitle) {
      doc.title = replaceTokens(Config.browserTitle);
    } else if (pageTitle) {
      doc.title =
        `${pageTitle}${separator}${companyName}`;
    } else if (Config.browserTitle) {
      doc.title = replaceTokens(Config.browserTitle);
    }

     
    if (favicon) {
      let faviconLink =
        qs('link[rel="icon"]');

      if (!faviconLink) {
        faviconLink =
          doc.createElement("link");

        faviconLink.rel = "icon";
        doc.head.appendChild(faviconLink);
      }

      faviconLink.href = favicon;
      faviconLink.type =
        favicon.endsWith(".svg")
          ? "image/svg+xml"
          : "";
    }

     
    qsa("[data-config]").forEach((element) => {
      const property =
        element.dataset.config;

      if (!property) return;

      const value = Config[property];

      if (
        typeof value === "string" ||
        typeof value === "number"
      ) {
        element.textContent =
          replaceTokens(String(value));
      }
    });

     
    qsa("[data-service-key]").forEach((element) => {
      const service =
        getService(element.dataset.serviceKey);

      if (!service) return;

      if (
        element.tagName === "A" &&
        service.url
      ) {
        element.href = service.url;
      }

      if (
        element.tagName === "OPTION" &&
        service.name
      ) {
        element.value = service.name;
      }

      if (
        element.hasAttribute("data-service-name") &&
        service.name
      ) {
        element.textContent = service.name;
      }

      if (
        element.hasAttribute("data-service-label") &&
        (
          service.label ||
          service.name
        )
      ) {
        element.textContent =
          service.label || service.name;
      }
    });
  }


  



  function registerGsap() {
    if (!win.gsap) return false;

    if (win.ScrollTrigger) {
      win.gsap.registerPlugin(
        win.ScrollTrigger
      );
    }

    return true;
  }


  



  function unlockPageScroll() {
    if (!doc.body) return;

    doc.body.classList.remove(
      "menu-open"
    );

    if (pageScrollLocked) {
      doc.body.style.position = "";
      doc.body.style.top = "";
      doc.body.style.left = "";
      doc.body.style.right = "";
      doc.body.style.width = "";

      win.requestAnimationFrame(() => {
        win.scrollTo(0, scrollLockY);
      });
    }

    doc.documentElement.style.overflow = "";
    doc.body.style.overflow = "";
    doc.documentElement.style.height = "";
    doc.body.style.height = "";

    pageScrollLocked = false;
  }

  function lockPageScroll() {
    if (!doc.body || pageScrollLocked) return;

    scrollLockY =
      win.scrollY ||
      win.pageYOffset ||
      doc.scrollingElement?.scrollTop ||
      doc.documentElement.scrollTop ||
      0;

    pageScrollLocked = true;

    doc.body.classList.add(
      "menu-open"
    );

    doc.body.style.position = "fixed";
    doc.body.style.top =
      `-${scrollLockY}px`;
    doc.body.style.left = "0";
    doc.body.style.right = "0";
    doc.body.style.width = "100%";
  }

  function restoreBodyScroll() {
    if (!doc.body) return;

    doc.body.classList.remove(
      "is-loading"
    );

    if (
      !doc.body.classList.contains(
        "menu-open"
      )
    ) {
      doc.documentElement.style.overflow = "";
      doc.body.style.overflow = "";
      doc.documentElement.style.height = "";
      doc.body.style.height = "";
    }
  }



  function getLoaderElements() {
    const loader =
      qs(".page-loader");

    if (!loader) return null;

    return {
      loader,
      brandFill:
        qs(".page-loader__brand-fill", loader),
      progress:
        qs(".page-loader__progress", loader),
      line:
        qs(".page-loader__line-fill", loader),
      status:
        qs(".page-loader__status", loader)
    };
  }

  function setLoaderProgress(
    elements,
    value
  ) {
    if (!elements) return;

    const progress =
      Math.max(0, Math.min(100, value));

    if (elements.progress) {
      elements.progress.textContent =
        `${Math.round(progress)}%`;
    }

    if (elements.brandFill) {
      elements.brandFill.style.width =
        `${progress}%`;
    }

    if (elements.line) {
      elements.line.style.width =
        `${progress}%`;
    }
  }

  function hideInitialLoader() {
    if (loaderHidden) {
      restoreBodyScroll();
      return;
    }

    loaderHidden = true;

    if (loaderFallbackTimer) {
      win.clearTimeout(
        loaderFallbackTimer
      );

      loaderFallbackTimer = null;
    }

    const elements =
      getLoaderElements();

    if (!elements) {
      restoreBodyScroll();
      return;
    }

    const { loader } = elements;

    if (
      prefersReducedMotion ||
      !win.gsap
    ) {
      setLoaderProgress(
        elements,
        100
      );

      loader.style.display = "none";

      restoreBodyScroll();

      return;
    }

    const state = {
      progress: 0
    };

    win.gsap.set(loader, {
      display: "flex",
      yPercent: 0,
      opacity: 1,
      visibility: "visible"
    });

    try {
      win.gsap.timeline({
        defaults: {
          ease: "power3.out"
        }
      })
        .to(state, {
          progress: 100,
          duration: 0.85,

          onUpdate: () => {
            setLoaderProgress(
              elements,
              state.progress
            );
          }
        })
        .to(
          loader,
          {
            yPercent: -100,
            duration: 0.72,
            ease: "power4.inOut",

            onComplete: () => {
              loader.classList.add(
                "is-hidden"
              );

              restoreBodyScroll();

              win.gsap.set(loader, {
                yPercent: 100
              });
            }
          },
          "+=0.08"
        );
    } catch {
      loader.classList.add(
        "is-hidden"
      );

      loader.style.display = "none";
      restoreBodyScroll();
    }
  }

  function isInternalPageLink(link) {
    if (!link) return false;

    const href =
      link.getAttribute("href");

    if (
      !href ||
      href === "#" ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      return false;
    }

    if (
      link.hasAttribute("download") ||
      link.target === "_blank" ||
      link.dataset.noTransition !== undefined
    ) {
      return false;
    }

    let url;

    try {
      url = new URL(
        link.href,
        win.location.href
      );
    } catch {
      return false;
    }

    if (
      url.origin !==
      win.location.origin
    ) {
      return false;
    }

    const sameDocument =
      url.pathname ===
        win.location.pathname &&
      url.search ===
        win.location.search;

    if (
      sameDocument &&
      url.hash
    ) {
      return false;
    }

    return true;
  }

  function navigateWithLoader(url) {
    const elements =
      getLoaderElements();

    if (
      !elements ||
      prefersReducedMotion ||
      !win.gsap
    ) {
      win.location.href = url;
      return;
    }

    loaderHidden = false;

    const {
      loader,
      status
    } = elements;

    loader.classList.remove(
      "is-hidden"
    );

    doc.body?.classList.add(
      "is-loading"
    );

    if (status) {
      status.textContent =
        "Preparing next page";
    }

    setLoaderProgress(
      elements,
      0
    );

    win.gsap.killTweensOf(loader);

    win.gsap.set(loader, {
      display: "flex",
      visibility: "visible",
      opacity: 1,
      yPercent: 100
    });

    const state = {
      progress: 0
    };

    const timeline =
      win.gsap.timeline({
        defaults: {
          ease: "power4.inOut"
        }
      });

    timeline
      .to(loader, {
        yPercent: 0,
        duration: 0.48
      })
      .to(
        state,
        {
          progress: 100,
          duration: 0.42,
          ease: "power2.out",

          onUpdate: () => {
            setLoaderProgress(
              elements,
              state.progress
            );
          }
        },
        "-=0.15"
      )
      .call(() => {
        win.location.href = url;
      });
  }

  function initPageTransitions() {
    doc.addEventListener(
      "click",
      (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        const link =
          event.target.closest("a");

        if (
          !isInternalPageLink(link)
        ) {
          return;
        }

        event.preventDefault();

        navigateWithLoader(
          link.href
        );
      }
    );

    win.addEventListener(
      "pageshow",
      (event) => {
        if (!event.persisted) return;

        const elements =
          getLoaderElements();

        if (elements?.loader) {
          elements.loader.style.display =
            "none";
        }

        restoreBodyScroll();
      }
    );
  }


  



  function initHeader() {
    const header =
      qs(".site-header");

    if (!header) return;

    let previousState = null;

    const updateHeader = () => {
      const scrolled =
        win.scrollY > 20;

      if (
        scrolled ===
        previousState
      ) {
        return;
      }

      previousState = scrolled;

      header.classList.toggle(
        "is-scrolled",
        scrolled
      );
    };

    updateHeader();

    win.addEventListener(
      "scroll",
      updateHeader,
      {
        passive: true
      }
    );
  }


  



  function initMenu() {
    const toggle =
      qs(".menu-toggle");

    const menu =
      qs(".mobile-menu");

    if (!toggle || !menu) return;

    if (
      menu.dataset.menuInitialized ===
      "true"
    ) {
      return;
    }

    menu.dataset.menuInitialized = "true";

    const closeMenu = () => {
      if (
        !menu.classList.contains(
          "is-open"
        )
      ) {
        unlockPageScroll();
        return;
      }

      toggle.classList.remove(
        "is-active"
      );

      menu.classList.remove(
        "is-open"
      );

      unlockPageScroll();

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menu.setAttribute(
        "aria-hidden",
        "true"
      );
    };

    const openMenu = () => {
      if (
        menu.classList.contains(
          "is-open"
        )
      ) {
        return;
      }

      toggle.classList.add(
        "is-active"
      );

      menu.classList.add(
        "is-open"
      );

      menu.scrollTop = 0;

      lockPageScroll();

      toggle.setAttribute(
        "aria-expanded",
        "true"
      );

      menu.setAttribute(
        "aria-hidden",
        "false"
      );
    };

    toggle.addEventListener(
      "click",
      () => {
        if (
          menu.classList.contains(
            "is-open"
          )
        ) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    );

    qsa("a", menu).forEach(
      (link) => {
        link.addEventListener(
          "click",
          closeMenu
        );
      }
    );

    doc.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape" &&
          menu.classList.contains(
            "is-open"
          )
        ) {
          closeMenu();
          toggle.focus();
        }
      }
    );

    win.addEventListener(
      "resize",
      () => {
        if (
          win.innerWidth > 1280 &&
          menu.classList.contains(
            "is-open"
          )
        ) {
          closeMenu();
        }
      }
    );

    win.addEventListener(
      "pagehide",
      closeMenu
    );
  }


  



  function initActiveNavigation() {
    const currentPath =
      win.location.pathname
        .split("/")
        .pop() || "index.html";

    qsa("[data-nav-page]").forEach(
      (link) => {
        const page =
          link.dataset.navPage;

        if (!page) return;

        const active =
          page === currentPath ||
          (
            page === "index.html" &&
            currentPath === ""
          );

        link.classList.toggle(
          "is-active",
          active
        );
      }
    );

    const hashLinks =
      qsa(
        '.site-nav__link[href*="#"], .mobile-menu__link[href*="#"]'
      );

    const currentHash =
      win.location.hash;

    if (currentHash) {
      hashLinks.forEach((link) => {
        const url =
          new URL(
            link.href,
            win.location.href
          );

        if (
          url.hash === currentHash &&
          url.pathname ===
            win.location.pathname
        ) {
          link.classList.add(
            "is-active"
          );
        }
      });
    }
  }


  



  function initAos() {
    if (!win.AOS) return;

    win.AOS.init({
      duration: 720,
      easing:
        "cubic-bezier(0.22, 1, 0.36, 1)",
      once: true,
      mirror: false,
      offset: 40,
      anchorPlacement:
        "top-bottom",
      disable: () =>
        prefersReducedMotion
    });
  }


  



  function initGlobalMotion() {
    if (
      prefersReducedMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    






    qsa("[data-gsap-reveal]").forEach(
      (element) => {
        const animation =
          win.gsap.fromTo(
            element,
            {
              y: 34,
              opacity: 0
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true
              }
            }
          );

        scrollTriggers.push(
          animation
        );
      }
    );

    qsa("[data-gsap-line]").forEach(
      (element) => {
        const animation =
          win.gsap.fromTo(
            element,
            {
              scaleX: 0,
              transformOrigin:
                "left center"
            },
            {
              scaleX: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 90%",
                once: true
              }
            }
          );

        scrollTriggers.push(
          animation
        );
      }
    );
  }


  



  function initCookieCard() {
    const card =
      qs(".cookie-card");

    if (!card) return;

    const accept =
      qs(
        ".cookie-card__button--accept",
        card
      );

    const close =
      qs(
        ".cookie-card__button--close",
        card
      );

    const key =
      "site-cookie-consent";

    let saved = null;

    try {
      saved =
        localStorage.getItem(key);
    } catch {
      saved = null;
    }

    const hideCard = () => {
      card.classList.remove(
        "is-visible"
      );

      card.setAttribute(
        "aria-hidden",
        "true"
      );
    };

    const saveChoice = (
      choice
    ) => {
      try {
        localStorage.setItem(
          key,
          choice
        );
      } catch {
         
      }

      hideCard();
    };

    if (!saved) {
      win.setTimeout(() => {
        card.classList.add(
          "is-visible"
        );

        card.setAttribute(
          "aria-hidden",
          "false"
        );
      }, 900);
    }

    accept?.addEventListener(
      "click",
      () => {
        saveChoice("accepted");
      }
    );

    close?.addEventListener(
      "click",
      () => {
        saveChoice("dismissed");
      }
    );
  }


  



  function initBackToTop() {
    const button =
      qs(".back-to-top");

    if (!button) return;

    let visibleState = null;

    const update = () => {
      const visible =
        win.scrollY > 650;

      if (
        visible === visibleState
      ) {
        return;
      }

      visibleState = visible;

      button.classList.toggle(
        "is-visible",
        visible
      );
    };

    update();

    win.addEventListener(
      "scroll",
      update,
      {
        passive: true
      }
    );

    button.addEventListener(
      "click",
      () => {
        win.scrollTo({
          top: 0,
          behavior:
            prefersReducedMotion
              ? "auto"
              : "smooth"
        });
      }
    );
  }


  



  function initContactForms() {
    const forms =
      qsa("[data-contact-form]");

    if (!forms.length) return;

    forms.forEach((form) => {
      let submitting = false;
      const submitButton =
        qs(
          '[type="submit"]',
          form
        );

      const submitLabel =
        submitButton
          ? qs("span", submitButton) ||
            submitButton
          : null;

      const originalText =
        submitLabel?.textContent || "";

      form.addEventListener(
        "submit",
        async (event) => {
          event.preventDefault();

          if (submitting) return;

          const status =
            qs(
              ".form-status",
              form
            ) ||
            form.parentElement?.querySelector(
              ".form-status"
            );

          const showStatus = (
            message,
            type
          ) => {
            if (!status) return;

            status.textContent =
              message;

            status.classList.remove(
              "is-success",
              "is-error"
            );

            status.classList.add(
              "is-visible",
              type === "success"
                ? "is-success"
                : "is-error"
            );
          };

          if (
            !form.checkValidity()
          ) {
            form.reportValidity();
            return;
          }

          submitting = true;

          if (submitButton) {
            submitButton.disabled = true;
            submitButton.setAttribute(
              "aria-busy",
              "true"
            );
          }

          if (submitLabel) {
            submitLabel.textContent =
              "Sending...";
          }

          if (status) {
            status.classList.remove(
              "is-visible",
              "is-success",
              "is-error"
            );
          }

          try {
            const formData =
              new FormData(form);

            const endpoint =
              form.getAttribute(
                "action"
              ) || "contact.php";

            const response =
              await fetch(endpoint, {
                method: "POST",
                body: formData,
                headers: {
                  "X-Requested-With":
                    "XMLHttpRequest"
                }
              });

            const raw =
              await response.text();

            let data = null;

            try {
              data =
                JSON.parse(raw);
            } catch {
              throw new Error(
                "Unable to send message. The PHP contact form is not available on this host."
              );
            }

            const serverSuccess =
              response.ok &&
              data?.success === true;

            if (!serverSuccess) {
              throw new Error(
                data?.message ||
                "Unable to send message. Please try again."
              );
            }

            showStatus(
              data?.message ||
                "Successfully sent",
              "success"
            );

            form.reset();
          } catch (error) {
            showStatus(
              error?.message ||
                "Unable to send your request. Please try again.",
              "error"
            );
          } finally {
            submitting = false;

            if (submitButton) {
              submitButton.disabled =
                false;

              submitButton.removeAttribute(
                "aria-busy"
              );
            }

            if (submitLabel) {
              submitLabel.textContent =
                originalText;
            }
          }
        }
      );
    });
  }


  



  function secureExternalLinks() {
    qsa(
      'a[target="_blank"]'
    ).forEach((link) => {
      const rel =
        new Set(
          (
            link.getAttribute("rel") ||
            ""
          )
            .split(/\s+/)
            .filter(Boolean)
        );

      rel.add("noopener");
      rel.add("noreferrer");

      link.setAttribute(
        "rel",
        [...rel].join(" ")
      );
    });
  }


  



  function initResizeRefresh() {
    if (!win.ScrollTrigger) return;

    let timeout = null;

    win.addEventListener(
      "resize",
      () => {
        clearTimeout(timeout);

        timeout =
          win.setTimeout(() => {
            win.ScrollTrigger.refresh();
          }, 180);
      }
    );
  }


  



  function safeInit(callback) {
    if (typeof callback !== "function") return;

    try {
      callback();
    } catch (error) {
      win.console?.warn?.(
        "AutoGlass init failed:",
        error
      );
    }
  }



  function init() {
    [
      applyConfig,
      registerGsap,
      initHeader,
      initMenu,
      initActiveNavigation,
      initAos,
      initGlobalMotion,
      initCookieCard,
      initBackToTop,
      initContactForms,
      secureExternalLinks,
      initResizeRefresh,
      initPageTransitions
    ].forEach(safeInit);
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


  



  if (
    doc.readyState === "complete"
  ) {
    win.setTimeout(
      hideInitialLoader,
      70
    );
  } else {
    win.addEventListener(
      "load",
      () => {
        win.setTimeout(
          hideInitialLoader,
          70
        );
      },
      {
        once: true
      }
    );
  }

  loaderFallbackTimer =
    win.setTimeout(
      hideInitialLoader,
      4200
    );

  win.addEventListener(
    "error",
    (event) => {
      const target =
        event.target;

      if (
        target &&
        target !== win &&
        ["IMG", "SCRIPT", "LINK"].includes(
          target.tagName
        )
      ) {
        win.setTimeout(
          hideInitialLoader,
          120
        );
      }
    },
    true
  );

  win.addEventListener(
    "pagehide",
    restoreBodyScroll
  );


  




  win.AutoGlassSite = {
    config: Config,

    qs,
    qsa,

    replaceTokens,

    refreshScrollTrigger() {
      if (win.ScrollTrigger) {
        win.ScrollTrigger.refresh();
      }
    },

    closeLoader() {
      hideInitialLoader();
    }
  };
})();
