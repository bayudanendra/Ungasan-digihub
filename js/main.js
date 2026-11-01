/* =====================================================================
   UNGASAN DIGIHUB - main.js
   JavaScript murni (tanpa jQuery / plugin).
   Menggantikan: jQuery, jQuery UI, nice-select, PureCounter, WOW.js,
   parallax.js, Slick, Magnific Popup, Isotope, imagesLoaded, Swiper.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Helper ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  // Setara jQuery slideToggle()
  function slideToggle(el, duration) {
    duration = duration || 400;
    var hidden = getComputedStyle(el).display === "none";
    el.style.overflow = "hidden";
    el.style.transition = "none";

    if (hidden) {
      el.style.display = "block";
      var target = el.scrollHeight;
      el.style.height = "0px";
      el.offsetHeight; // paksa reflow
      el.style.transition = "height " + duration + "ms ease";
      el.style.height = target + "px";
      setTimeout(function () {
        el.style.height = el.style.overflow = el.style.transition = "";
      }, duration);
    } else {
      el.style.height = el.offsetHeight + "px";
      el.offsetHeight;
      el.style.transition = "height " + duration + "ms ease";
      el.style.height = "0px";
      setTimeout(function () {
        el.style.display = "none";
        el.style.height = el.style.overflow = el.style.transition = "";
      }, duration);
    }
  }

  /* ---------- 01. Preloader ---------- */
  function initPreloader() {
    var loader = $("#it-loading");
    if (!loader) return;
    var hide = function () {
      loader.style.transition = "opacity 500ms ease";
      loader.style.opacity = "0";
      setTimeout(function () { loader.style.display = "none"; }, 500);
    };
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide);
  }

  /* ---------- 02. Tinggi header + sticky header + tombol scroll-top ---------- */
  function initHeaderAndScroll() {
    var headerWrap = $(".it-header-height");
    if (headerWrap) headerWrap.style.height = headerWrap.offsetHeight + "px";

    var fixedHeader = $(".it-header-fixed");
    function updateHeaderOffset() {
      if (!fixedHeader) return;
      var h = fixedHeader.offsetHeight;
      document.body.style.paddingTop = h + "px";
      document.documentElement.style.scrollPaddingTop = h + "px";
    }
    updateHeaderOffset();
    window.addEventListener("resize", updateHeaderOffset);

    var sticky = $("#header-sticky");
    var toTop = $(".scroll-to-target");

    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (sticky) sticky.classList.toggle("header-sticky", y >= 400);
      if (toTop) toTop.classList.toggle("open", y >= 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener("click", function () {
        var target = $(toTop.getAttribute("data-target") || "html");
        var top = target ? target.getBoundingClientRect().top + window.pageYOffset : 0;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    }
  }

  /* ---------- 03. Offcanvas + search popup + overlay ---------- */
  function initOffcanvas() {
    var panel = $(".itoffcanvas");
    var overlay = $(".body-overlay");
    var search = $(".search-popup");

    function open() {
      if (panel) panel.classList.add("opened");
      if (overlay) overlay.classList.add("apply");
    }
    function close() {
      if (panel) panel.classList.remove("opened");
      if (overlay) overlay.classList.remove("apply");
      if (search) search.classList.remove("search-active");
      var legacy = $(".search__popup");
      if (legacy) legacy.classList.remove("search-opened");
    }

    $$(".it-menu-bar").forEach(function (b) { b.addEventListener("click", open); });
    $$(".close-btn").forEach(function (b) { b.addEventListener("click", close); });
    if (overlay) overlay.addEventListener("click", close);

    // Search popup (aktif bila ada tombol .search-box-outer)
    $$(".search-box-outer").forEach(function (b) {
      b.addEventListener("click", function () {
        if (search) search.classList.add("search-active");
        if (overlay) overlay.classList.add("apply");
      });
    });
    $$(".close-search").forEach(function (b) { b.addEventListener("click", close); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- 04. Menu mobile (salin menu desktop + dropdown) ---------- */
  function initMobileMenu() {
    var desktopMenu = $(".it-menu-content");
    var mobileBox = $(".it-menu-mobile");
    if (!desktopMenu || !mobileBox) return;

    mobileBox.innerHTML = desktopMenu.outerHTML;

    $$(".has-dropdown > a", mobileBox).forEach(function (link) {
      var btn = document.createElement("button");
      btn.className = "dropdown-toggle-btn";
      btn.innerHTML = "<i class='fal fa-angle-right'></i>";
      link.appendChild(btn);

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var li = link.parentElement;
        btn.classList.toggle("dropdown-opened");
        link.classList.toggle("expanded");
        li.classList.add("dropdown-opened");
        Array.prototype.forEach.call(li.parentElement.children, function (sib) {
          if (sib !== li) sib.classList.remove("dropdown-opened");
        });
        var sub = Array.prototype.filter.call(li.children, function (c) {
          return c.classList.contains("it-submenu");
        })[0];
        if (sub) slideToggle(sub);
      });
    });
  }

  /* ---------- 05. Select kustom (pengganti jQuery niceSelect) ---------- */
  function initNiceSelect() {
    var selects = $$("select");
    if (!selects.length) return;

    function build(select) {
      if (select.nextElementSibling && select.nextElementSibling.classList.contains("nice-select")) return;
      var wrap = document.createElement("div");
      wrap.className = ("nice-select " + (select.className || "") + (select.disabled ? " disabled" : "")).trim();
      if (!select.disabled) wrap.setAttribute("tabindex", "0");

      var current = document.createElement("span");
      current.className = "current";
      var list = document.createElement("ul");
      list.className = "list";

      var chosen = select.options[select.selectedIndex];
      current.textContent = chosen ? (chosen.dataset.display || chosen.text) : "";

      Array.prototype.forEach.call(select.options, function (opt) {
        var li = document.createElement("li");
        li.className = "option" + (opt.selected ? " selected" : "") + (opt.disabled ? " disabled" : "");
        li.setAttribute("data-value", opt.value);
        li.textContent = opt.text;
        list.appendChild(li);
      });

      wrap.appendChild(current);
      wrap.appendChild(list);
      select.style.display = "none";
      select.parentNode.insertBefore(wrap, select.nextSibling);
    }
    selects.forEach(build);

    function closeAll(except) {
      $$(".nice-select").forEach(function (n) { if (n !== except) n.classList.remove("open"); });
    }
    function toggle(box) {
      closeAll(box);
      box.classList.toggle("open");
      if (box.classList.contains("open")) {
        var f = $(".focus", box); if (f) f.classList.remove("focus");
        var s = $(".selected", box); if (s) s.classList.add("focus");
      } else {
        box.focus();
      }
    }
    function choose(opt) {
      var box = opt.closest(".nice-select");
      var sel = box.previousElementSibling;
      var s = $(".selected", box); if (s) s.classList.remove("selected");
      opt.classList.add("selected");
      $(".current", box).textContent = opt.textContent;
      sel.value = opt.getAttribute("data-value");
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    }

    document.addEventListener("click", function (e) {
      var box = e.target.closest(".nice-select");
      if (!box) { closeAll(); return; }
      var opt = e.target.closest(".option");
      if (opt && !opt.classList.contains("disabled")) choose(opt);
      toggle(box);
    });

    document.addEventListener("keydown", function (e) {
      var box = e.target.closest && e.target.closest(".nice-select");
      if (!box) return;
      var focused = $(".focus", box) || $(".option.selected", box);
      var isOpen = box.classList.contains("open");
      var move = function (dir) {
        var n = focused;
        do { n = dir > 0 ? n.nextElementSibling : n.previousElementSibling; }
        while (n && n.classList.contains("disabled"));
        if (n) { if (focused) focused.classList.remove("focus"); n.classList.add("focus"); }
      };
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (isOpen && focused) { choose(focused); }
        toggle(box);
      } else if (e.key === "ArrowDown") { e.preventDefault(); isOpen ? move(1) : toggle(box); }
      else if (e.key === "ArrowUp") { e.preventDefault(); isOpen ? move(-1) : toggle(box); }
      else if (e.key === "Escape" && isOpen) { toggle(box); }
    });
  }

  /* ---------- 06. Counter angka (pengganti PureCounter) ---------- */
  function initCounters() {
    var counters = $$(".purecounter");
    if (!counters.length) return;

    function run(el) {
      var start = parseFloat(el.getAttribute("data-purecounter-start")) || 0;
      var end = parseFloat(el.getAttribute("data-purecounter-end")) || 0;
      var dur = (parseFloat(el.getAttribute("data-purecounter-duration")) || 2) * 1000;
      var decimals = parseInt(el.getAttribute("data-purecounter-decimals"), 10) || 0;
      var t0 = null;

      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = (start + (end - start) * p).toFixed(decimals);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!("IntersectionObserver" in window)) { counters.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.unobserve(en.target); run(en.target); }
      });
    }, { threshold: 0.2 });
    counters.forEach(function (c) { io.observe(c); });
  }

  /* ---------- 07. Animasi saat scroll (pengganti WOW.js) ---------- */
  function initReveal() {
    var items = $$(".wow");
    if (!items.length) return;

    function setStyle(el, hidden) {
      el.style.visibility = hidden ? "hidden" : "visible";
      el.style.animationName = hidden ? "none" : "";
    }
    items.forEach(function (el) {
      var d = el.getAttribute("data-wow-duration");
      var l = el.getAttribute("data-wow-delay");
      var i = el.getAttribute("data-wow-iteration");
      if (d) el.style.animationDuration = d;
      if (l) el.style.animationDelay = l;
      if (i) el.style.animationIterationCount = i;
      setStyle(el, true);
    });

    function show(el) {
      setStyle(el, false);
      el.classList.add("animated");
    }
    if (!("IntersectionObserver" in window)) { items.forEach(show); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.unobserve(en.target); show(en.target); }
      });
    }, { rootMargin: "0px 0px -1px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 08. Parallax mouse di hero (pengganti parallax.js) ---------- */
  function initParallax() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function scene(root, scalarX, scalarY) {
      var layers = $$(".layer", root);
      if (!layers.length) return;

      if (getComputedStyle(root).position === "static") root.style.position = "relative";
      layers.forEach(function (l, idx) {
        l.style.position = idx === 0 ? "relative" : "absolute";
        l.style.display = "block";
        l.style.left = "0";
        l.style.top = "0";
        l.style.willChange = "transform";
      });
      var depths = layers.map(function (l) { return parseFloat(l.getAttribute("data-depth")) || 0; });

      var ix = 0, iy = 0, vx = 0, vy = 0, friction = 0.1, raf = null;

      window.addEventListener("mousemove", function (e) {
        var w = window.innerWidth, h = window.innerHeight;
        ix = (e.clientX - w * 0.5) / Math.max(w * 0.5, w - w * 0.5);
        iy = (e.clientY - h * 0.5) / Math.max(h * 0.5, h - h * 0.5);
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });

      function tick() {
        var r = root.getBoundingClientRect();
        var mx = ix * r.width * (scalarX / 100);
        var my = iy * r.height * (scalarY / 100);
        vx += (mx - vx) * friction;
        vy += (my - vy) * friction;
        layers.forEach(function (l, i) {
          l.style.transform = "translate3d(" + (-vx * depths[i]) + "px," + (-vy * depths[i]) + "px,0)";
        });
        raf = (Math.abs(mx - vx) > 0.05 || Math.abs(my - vy) > 0.05) ? requestAnimationFrame(tick) : null;
      }
    }

    $$(".scene").forEach(function (el) { scene(el, 5, 5); });
    $$(".scene-y").forEach(function (el) { scene(el, 0, 5); });
  }

  /* ---------- 09. Accordion FAQ ---------- */
  function initFaqAccordion() {
    var root = document.getElementById("faqAccordion");
    if (!root) return;

    var items = $$(".fq-item", root);

    function setHeight(item, open) {
      var panel = $(".fq-answer", item);
      if (!panel) return;
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
    }

    items.forEach(function (item) {
      var button = $(".fq-question", item);
      var isOpen = item.classList.contains("is-open");
      if (!button) return;

      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      setHeight(item, isOpen);

      button.addEventListener("click", function () {
        var open = !item.classList.contains("is-open");

        items.forEach(function (other) {
          if (other === item) return;
          other.classList.remove("is-open");
          var otherBtn = $(".fq-question", other);
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          setHeight(other, false);
        });

        item.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", open ? "true" : "false");
        setHeight(item, open);
      });
    });

    function refreshOpenItems() {
      items.forEach(function (item) {
        if (item.classList.contains("is-open")) setHeight(item, true);
      });
    }

    window.addEventListener("resize", refreshOpenItems);
    window.addEventListener("load", refreshOpenItems);
  }

  /* ---------- 10. Tahun copyright footer ---------- */
  function initFooterYear() {
    var year = document.getElementById("footerYear");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- Start ---------- */
  initPreloader();
  initHeaderAndScroll();
  initOffcanvas();
  initMobileMenu();
  initNiceSelect();
  initCounters();
  initReveal();
  initParallax();
  initFaqAccordion();
  initFooterYear();
})();
