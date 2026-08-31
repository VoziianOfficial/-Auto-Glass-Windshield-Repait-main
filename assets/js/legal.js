




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


  



  function ensureLegalScroll() {
    const main = qs(".legal-main");

    if (!main) return;

    




    if (
      doc.body &&
      !doc.body.classList.contains("menu-open") &&
      !doc.body.classList.contains("is-loading")
    ) {
      doc.documentElement.style.height = "auto";
      doc.body.style.height = "auto";
    }
  }


  



  function getSidebarLinks() {
    return qsa(
      '.legal-sidebar__link[href^="#"]'
    );
  }

  function getSectionFromLink(link) {
    if (!link) return null;

    const href =
      link.getAttribute("href");

    if (
      !href ||
      !href.startsWith("#") ||
      href === "#"
    ) {
      return null;
    }

    try {
      return doc.querySelector(href);
    } catch {
      return null;
    }
  }


  



  function initActiveSections() {
    const links =
      getSidebarLinks();

    if (!links.length) return;

    const entries = links
      .map((link) => ({
        link,
        section:
          getSectionFromLink(link)
      }))
      .filter(
        (item) => item.section
      );

    if (!entries.length) return;

    let activeId = null;

    function setActive(id) {
      if (
        !id ||
        activeId === id
      ) {
        return;
      }

      activeId = id;

      entries.forEach(
        ({ link, section }) => {
          const active =
            section.id === id;

          link.classList.toggle(
            "is-active",
            active
          );

          if (active) {
            link.setAttribute(
              "aria-current",
              "true"
            );
          } else {
            link.removeAttribute(
              "aria-current"
            );
          }
        }
      );
    }

    function updateActiveSection() {
      const headerHeight =
        qs(".site-header")
          ?.offsetHeight || 0;

      const triggerPoint =
        headerHeight + 120;

      let current =
        entries[0].section.id;

      entries.forEach(
        ({ section }) => {
          const rect =
            section.getBoundingClientRect();

          if (
            rect.top <=
            triggerPoint
          ) {
            current =
              section.id;
          }
        }
      );

      setActive(current);
    }

    updateActiveSection();

    win.addEventListener(
      "scroll",
      updateActiveSection,
      {
        passive: true
      }
    );

    win.addEventListener(
      "resize",
      updateActiveSection
    );
  }


  



  function initSidebarNavigation() {
    const links =
      getSidebarLinks();

    if (!links.length) return;

    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const section =
            getSectionFromLink(link);

          if (!section) return;

          event.preventDefault();

          const headerHeight =
            qs(".site-header")
              ?.offsetHeight || 0;

          const offset =
            headerHeight + 24;

          const top =
            section.getBoundingClientRect()
              .top +
            win.scrollY -
            offset;

          win.scrollTo({
            top,
            behavior: reduceMotion
              ? "auto"
              : "smooth"
          });

          if (
            win.history &&
            typeof win.history.replaceState ===
              "function"
          ) {
            win.history.replaceState(
              null,
              "",
              `#${section.id}`
            );
          }
        }
      );
    });
  }


  



  function initHashPosition() {
    const hash =
      win.location.hash;

    if (
      !hash ||
      hash === "#"
    ) {
      return;
    }

    let section;

    try {
      section =
        doc.querySelector(hash);
    } catch {
      section = null;
    }

    if (!section) return;

    




    win.setTimeout(() => {
      const headerHeight =
        qs(".site-header")
          ?.offsetHeight || 0;

      const top =
        section.getBoundingClientRect()
          .top +
        win.scrollY -
        headerHeight -
        24;

      win.scrollTo({
        top,
        behavior: "auto"
      });
    }, 120);
  }


  



  function initLegalMotion() {
    if (
      reduceMotion ||
      !win.gsap ||
      !win.ScrollTrigger
    ) {
      return;
    }

    const article =
      qs(".legal-article");

    if (!article) return;

    const sections = qsa(
      ".legal-section",
      article
    );

    if (!sections.length) return;

    sections.forEach(
      (section) => {
        win.gsap.fromTo(
          section,
          {
            y: 22,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: "power3.out",

            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              once: true
            }
          }
        );
      }
    );
  }


  



  function initTables() {
    qsa(
      ".legal-table-wrap"
    ).forEach((wrapper) => {
      const table =
        qs(
          ".legal-table",
          wrapper
        );

      if (!table) return;

      wrapper.setAttribute(
        "tabindex",
        "0"
      );

      wrapper.setAttribute(
        "role",
        "region"
      );

      wrapper.setAttribute(
        "aria-label",
        "Scrollable policy table"
      );
    });
  }


  



  function safeInit(callback) {
    if (typeof callback !== "function") return;

    try {
      callback();
    } catch (error) {
      win.console?.warn?.(
        "AutoGlass legal init failed:",
        error
      );
    }
  }



  function init() {
    [
      ensureLegalScroll,
      initSidebarNavigation,
      initActiveSections,
      initTables,
      initLegalMotion,
      initHashPosition
    ].forEach(safeInit);

    win.setTimeout(
      ensureLegalScroll,
      300
    );

    win.setTimeout(
      ensureLegalScroll,
      900
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
