/* ==========================================================================
   Maison Miléora — main.js
   Handles: language switching, navigation, scroll effects, testimonials,
            gallery + lightbox, form validation, cookie consent, back to top.
   ========================================================================== */
(function () {
  "use strict";

  var STORE_LANG = "mileora_lang";
  var STORE_COOKIE = "mileora_cookie_consent";
  var docEl = document.documentElement;

  /* ---------------------------------------------------------------- utils */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  // localStorage is unavailable when the site runs from disk (file://), so we fall
  // back to window.name, which survives navigation within the same browser tab.
  var MEMO = "MILEORA|";

  function store(key, value) {
    try {
      if (value === undefined) {
        var saved = window.localStorage.getItem(key);
        if (saved !== null) return saved;
      } else {
        window.localStorage.setItem(key, value);
      }
    } catch (e) { /* blocked — use the fallback below */ }

    try {
      var data = window.name.indexOf(MEMO) === 0 ? JSON.parse(window.name.slice(MEMO.length)) : {};
      if (value === undefined) return data[key] === undefined ? null : data[key];
      data[key] = value;
      window.name = MEMO + JSON.stringify(data);
    } catch (e) { /* nothing else we can do; defaults apply */ }

    return null;
  }

  /* ------------------------------------------------------------ language */
  var dict = window.MILEORA_I18N || {};

  // Carry the chosen language in internal links. localStorage is unavailable when
  // the site is opened straight from disk (file://), so the ?lang= parameter keeps
  // the language while navigating in either case.
  function syncLinks(lang) {
    $$("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || /^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) return;
      var parts = href.split("#");
      var path = parts[0].split("?")[0];
      if (!path) return;
      a.setAttribute("href", path + (lang === "mk" ? "?lang=mk" : "") + (parts[1] ? "#" + parts[1] : ""));
    });
  }

  function translate(lang) {
    var isMK = lang === "mk";
    docEl.setAttribute("lang", isMK ? "mk" : "en");

    $$("[data-i18n]").forEach(function (el) {
      var entry = dict[el.getAttribute("data-i18n")];
      if (!entry) return;
      if (el.dataset.i18nEn === undefined) el.dataset.i18nEn = el.innerHTML;
      el.innerHTML = isMK ? entry : el.dataset.i18nEn;
    });

    $$("[data-i18n-attr]").forEach(function (el) {
      // format: "placeholder:key|aria-label:key"
      el.getAttribute("data-i18n-attr").split("|").forEach(function (pair) {
        var bits = pair.split(":");
        var attr = bits[0];
        var entry = dict[bits[1]];
        if (!entry) return;
        var memo = "i18nAttr" + attr.replace(/-/g, "");
        if (el.dataset[memo] === undefined) el.dataset[memo] = el.getAttribute(attr) || "";
        el.setAttribute(attr, isMK ? entry : el.dataset[memo]);
      });
    });

    $$("[data-lang-btn]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });

    syncLinks(lang);

    document.dispatchEvent(new CustomEvent("mileora:langchange", { detail: { lang: lang } }));
  }

  function initLanguage() {
    // Priority: ?lang= in the URL (shareable links) > saved choice > browser language
    var param = (window.location.search.match(/[?&]lang=(mk|en)/i) || [])[1];
    var saved = param ? param.toLowerCase() : store(STORE_LANG);
    var lang = saved === "mk" || saved === "en" ? saved : (navigator.language || "").toLowerCase().indexOf("mk") === 0 ? "mk" : "en";
    if (param) store(STORE_LANG, lang);

    $$("[data-lang-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = btn.getAttribute("data-lang-btn");
        store(STORE_LANG, next);
        translate(next);
      });
    });

    translate(lang);
  }

  /* -------------------------------------------------------------- header */
  function initHeader() {
    var header = $(".site-header");
    var toTop = $(".to-top");
    if (!header) return;
    var solidFrom = header.hasAttribute("data-always-solid") ? -1 : 40;

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle("is-solid", y > solidFrom);
      if (toTop) toTop.classList.toggle("is-visible", y > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* -------------------------------------------------------------- drawer */
  function initDrawer() {
    var burger = $(".burger");
    var drawer = $(".drawer");
    if (!burger || !drawer) return;

    function setOpen(open) {
      burger.classList.toggle("is-open", open);
      drawer.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("is-locked", open);
    }

    burger.addEventListener("click", function () {
      setOpen(!drawer.classList.contains("is-open"));
    });

    $$(".drawer__link, .drawer .btn", drawer).forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) setOpen(false);
    });
  }

  /* -------------------------------------------------------------- reveal */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------- testimonials */
  function initQuotes() {
    var wrap = $(".quotes");
    if (!wrap) return;
    var quotes = $$(".quote", wrap);
    var dots = $$(".quotes__dot", wrap);
    if (quotes.length < 2) return;
    var index = 0;
    var timer;

    function show(i) {
      index = (i + quotes.length) % quotes.length;
      quotes.forEach(function (q, n) { q.classList.toggle("is-active", n === index); });
      dots.forEach(function (d, n) { d.setAttribute("aria-selected", n === index ? "true" : "false"); });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () { show(index + 1); }, 7000);
    }

    dots.forEach(function (dot, n) {
      dot.addEventListener("click", function () { show(n); play(); });
    });

    wrap.addEventListener("mouseenter", function () { clearInterval(timer); });
    wrap.addEventListener("mouseleave", play);

    show(0);
    play();
  }

  /* ---------------------------------------------------- gallery lightbox */
  function initGallery() {
    var items = $$(".gallery-item");
    var box = $(".lightbox");
    if (!items.length || !box) return;

    var img = $(".lightbox__img", box);
    var caption = $(".lightbox__caption", box);
    var visible = items;
    var current = 0;
    var lastFocus = null;

    function open(i) {
      visible = items.filter(function (el) { return el.style.display !== "none"; });
      current = visible.indexOf(items[i]) > -1 ? visible.indexOf(items[i]) : 0;
      lastFocus = document.activeElement;
      render();
      box.classList.add("is-open");
      document.body.classList.add("is-locked");
      $(".lightbox__close", box).focus();
    }

    function render() {
      var el = visible[current];
      if (!el) return;
      var source = el.getAttribute("data-full") || $("img", el).getAttribute("src");
      img.setAttribute("src", source);
      img.setAttribute("alt", $("img", el).getAttribute("alt") || "");
      var label = $(".gallery-item__label", el);
      caption.textContent = label ? label.textContent.trim() : "";
    }

    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      if (lastFocus) lastFocus.focus();
    }

    function move(step) {
      current = (current + step + visible.length) % visible.length;
      render();
    }

    items.forEach(function (el, i) {
      el.addEventListener("click", function () { open(i); });
    });

    $(".lightbox__close", box).addEventListener("click", close);
    $(".lightbox__prev", box).addEventListener("click", function () { move(-1); });
    $(".lightbox__next", box).addEventListener("click", function () { move(1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    });
  }

  /* ------------------------------------------------------ gallery filter */
  function initFilters() {
    var filters = $$(".filter");
    if (!filters.length) return;

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        $$(".gallery-item").forEach(function (item) {
          var match = target === "all" || item.getAttribute("data-category") === target;
          item.style.display = match ? "" : "none";
        });
      });
    });
  }

  /* --------------------------------------------------------- menu catnav */
  function initCatnav() {
    var links = $$(".catnav__link");
    if (!links.length) return;
    var sections = links
      .map(function (l) { return document.getElementById(l.getAttribute("href").slice(1)); })
      .filter(Boolean);
    if (!sections.length) return;

    function onScroll() {
      var pos = window.scrollY + 180;
      var activeId = sections[0].id;
      sections.forEach(function (s) { if (s.offsetTop <= pos) activeId = s.id; });
      links.forEach(function (l) {
        l.classList.toggle("is-active", l.getAttribute("href") === "#" + activeId);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------- forms */
  function initForms() {
    var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    var PHONE = /^[+\d][\d\s()\-/]{5,}$/;

    $$("form[data-validate]").forEach(function (form) {
      var success = $("#" + form.getAttribute("data-success"));

      function fieldError(input, on) {
        var field = input.closest(".field");
        if (field) field.classList.toggle("has-error", on);
      }

      function validate(input) {
        var value = (input.value || "").trim();
        var ok = true;
        if (input.hasAttribute("required") && !value) ok = false;
        else if (value && input.type === "email" && !EMAIL.test(value)) ok = false;
        else if (value && input.type === "tel" && !PHONE.test(value)) ok = false;
        else if (value && input.type === "number" && input.hasAttribute("min") && Number(value) < Number(input.getAttribute("min"))) ok = false;
        else if (value && input.type === "number" && input.hasAttribute("max") && Number(value) > Number(input.getAttribute("max"))) ok = false;
        fieldError(input, !ok);
        return ok;
      }

      $$("input, select, textarea", form).forEach(function (input) {
        input.addEventListener("blur", function () { if (input.value.trim() || input.hasAttribute("required")) validate(input); });
        input.addEventListener("input", function () {
          if (input.closest(".field") && input.closest(".field").classList.contains("has-error")) validate(input);
        });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var firstBad = null;
        $$("input, select, textarea", form).forEach(function (input) {
          if (!validate(input) && !firstBad) firstBad = input;
        });

        if (firstBad) {
          firstBad.focus();
          firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        // Demo submission: a static site has no server, so the request is simulated.
        if (success) {
          success.classList.add("is-visible");
          success.setAttribute("tabindex", "-1");
          success.focus();
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        form.reset();
      });
    });

    // Reservation date: no past dates
    $$("input[type='date']").forEach(function (input) {
      if (!input.getAttribute("min")) input.setAttribute("min", new Date().toISOString().split("T")[0]);
    });
  }

  /* -------------------------------------------------------------- cookies */
  function initCookies() {
    var banner = $(".cookie");
    var modal = $("#cookie-settings");
    if (!banner) return;

    var saved = store(STORE_COOKIE);

    function save(prefs) {
      store(STORE_COOKIE, JSON.stringify(prefs));
      banner.classList.remove("is-visible");
      if (modal) modal.classList.remove("is-open");
      document.body.classList.remove("is-locked");
    }

    if (!saved) {
      window.setTimeout(function () { banner.classList.add("is-visible"); }, 1200);
    }

    $$("[data-cookie]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-cookie");
        if (action === "accept") save({ necessary: true, analytics: true, marketing: true, at: Date.now() });
        if (action === "reject") save({ necessary: true, analytics: false, marketing: false, at: Date.now() });
        if (action === "settings" && modal) {
          modal.classList.add("is-open");
          document.body.classList.add("is-locked");
          var close = $(".modal__close", modal);
          if (close) close.focus();
        }
        if (action === "save" && modal) {
          save({
            necessary: true,
            analytics: $("#cookie-analytics") ? $("#cookie-analytics").checked : false,
            marketing: $("#cookie-marketing") ? $("#cookie-marketing").checked : false,
            at: Date.now()
          });
        }
        if (action === "close" && modal) {
          modal.classList.remove("is-open");
          document.body.classList.remove("is-locked");
        }
        if (action === "reopen") {
          banner.classList.add("is-visible");
          if (modal) {
            modal.classList.add("is-open");
            document.body.classList.add("is-locked");
          }
        }
      });
    });

    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          modal.classList.remove("is-open");
          document.body.classList.remove("is-locked");
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal.classList.contains("is-open")) {
          modal.classList.remove("is-open");
          document.body.classList.remove("is-locked");
        }
      });
    }
  }

  /* ------------------------------------------------------------ the year */
  function initYear() {
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ----------------------------------------------------------------- boot */
  function boot() {
    initLanguage();
    initHeader();
    initDrawer();
    initReveal();
    initQuotes();
    initGallery();
    initFilters();
    initCatnav();
    initForms();
    initCookies();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
