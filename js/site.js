/* ==========================================================================
   ILUMINATO — Espaço de Eventos | Comportamento do site
   Sem dependências externas.
   ========================================================================== */

/* ---------------------------------------------------------- Configuração */
window.ILUMINATO = Object.assign({
  /* Cole o ID do Google Analytics 4 (ex.: "G-XXXXXXX"). Deixe "" para desativar. */
  ga4Id: ""
}, window.ILUMINATO || {});

(function () {
  "use strict";

  /* Marca que o JS está ativo: o conteúdo animado só some se houver JS. */
  document.documentElement.classList.add("js");
  window.__ILUMINATO_ATIVO__ = true;

  var GA4_ID = window.ILUMINATO.ga4Id;
  window.dataLayer = window.dataLayer || [];

  /* ------------------------------------------------------- 1. Analytics */
  function track(name, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (typeof window.gtag === "function") window.gtag("event", name, params);
    if (!GA4_ID && window.console && console.debug) console.debug("[analytics]", name, params);
  }

  function loadGA4() {
    if (!GA4_ID) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA4_ID, { send_page_view: true });
  }

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* --------------------------------------------- 2. Header + menu mobile */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var toggle = header.querySelector(".menu-toggle");
    var panel = document.getElementById("menu-mobile");
    var lastFocus = null;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!toggle || !panel) return;

    function setOpen(open) {
      header.classList.toggle("nav-aberto", open);
      panel.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("is-locked", open);
      if (open) {
        lastFocus = document.activeElement;
        var first = panel.querySelector("a, button");
        if (first) first.focus();
      } else if (lastFocus) {
        lastFocus.focus();
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!panel.classList.contains("is-open"));
    });

    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) setOpen(false);
      if (e.key !== "Tab" || !panel.classList.contains("is-open")) return;
      var focusables = panel.querySelectorAll("a[href], button:not([disabled])");
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* --------------------------------------------------- 3. Link ativo */
  function initActiveNav() {
    var path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (path === "") path = "index.html";

    /* Páginas internas que continuam destacando o item de menu principal */
    var groups = {
      "eventos.html": ["eventos.html", "casamentos.html", "celebracoes.html", "corporativos.html"]
    };

    document.querySelectorAll("[data-nav]").forEach(function (el) {
      var target = (el.getAttribute("data-nav") || "").toLowerCase();
      var match = target === path ||
        (groups[target] && groups[target].indexOf(path) !== -1);
      if (match) el.setAttribute("aria-current", "page");
    });
  }

  /* ------------------------------------------------- 4. Revelar no scroll */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });

    /* Rede de segurança: se o observer não disparar, nada fica invisível. */
    window.setTimeout(function () {
      if (document.querySelector(".reveal.is-visible")) return;
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }, 3000);
  }

  /* ------------------------------------------------------- 5. Lightbox */
  function initLightbox() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-gallery-item]"));
    if (!triggers.length) return;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Visualização de imagem");
    box.innerHTML =
      '<button class="lightbox__btn lightbox__close" type="button" aria-label="Fechar imagem">&#10005;</button>' +
      '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Imagem anterior">&#8592;</button>' +
      '<button class="lightbox__btn lightbox__next" type="button" aria-label="Próxima imagem">&#8594;</button>' +
      '<figure class="lightbox__figure">' +
        '<img class="lightbox__img" alt="">' +
        '<figcaption class="lightbox__caption"></figcaption>' +
      '</figure>' +
      '<span class="lightbox__count" aria-live="polite"></span>';
    document.body.appendChild(box);

    var img = box.querySelector(".lightbox__img");
    var cap = box.querySelector(".lightbox__caption");
    var counter = box.querySelector(".lightbox__count");
    var index = 0;
    var origin = null;

    function render() {
      var el = triggers[index];
      img.src = el.getAttribute("data-full") || el.querySelector("img").src;
      img.alt = el.querySelector("img") ? el.querySelector("img").alt : "";
      cap.textContent = el.getAttribute("data-caption") || "";
      counter.textContent = (index + 1) + " / " + triggers.length;
    }

    function open(i) {
      index = i;
      origin = triggers[i];
      render();
      box.classList.add("is-open");
      document.body.classList.add("is-locked");
      box.querySelector(".lightbox__close").focus();
      track("gallery_open", { item_index: index + 1, item_label: triggers[index].getAttribute("data-caption") || "" });
    }

    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      if (origin) origin.focus();
    }

    function step(delta) {
      index = (index + delta + triggers.length) % triggers.length;
      render();
    }

    triggers.forEach(function (el, i) {
      el.addEventListener("click", function () { open(i); });
    });

    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__prev").addEventListener("click", function () { step(-1); });
    box.querySelector(".lightbox__next").addEventListener("click", function () { step(1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* --------------------------------------------------------- 6. Formulário */
  function onlyDigits(v) { return (v || "").replace(/\D/g, ""); }

  function formatPhone(v) {
    var d = onlyDigits(v).slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  function setError(field, message) {
    var wrap = field.closest(".field");
    var err = wrap ? wrap.querySelector(".field__error") : null;
    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (err) {
        if (!err.id) err.id = field.id + "-erro";
        err.textContent = message;
        field.setAttribute("aria-describedby", err.id);
      }
    } else {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
      if (err) err.textContent = "";
    }
  }

  function validate(field) {
    var value = (field.value || "").trim();
    var name = field.name || "";
    if (field.hasAttribute("required") && !value) {
      setError(field, "Este campo é obrigatório.");
      return false;
    }
    if (name === "nome" && value.length < 2) {
      setError(field, "Informe seu nome completo.");
      return false;
    }
    if (name === "whatsapp" && onlyDigits(value).length < 10) {
      setError(field, "Informe um telefone válido com DDD.");
      return false;
    }
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError(field, "Informe um e-mail válido.");
      return false;
    }
    setError(field, "");
    return true;
  }

  function initForm() {
    var form = document.getElementById("form-contato");
    if (!form) return;
    var success = document.getElementById("form-success");
    var started = false;
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));

    var phone = form.querySelector('[name="whatsapp"]');
    if (phone) {
      phone.setAttribute("inputmode", "numeric");
      phone.addEventListener("input", function () { phone.value = formatPhone(phone.value); });
    }

    var date = form.querySelector('[name="data"]');
    if (date) {
      var today = new Date();
      date.min = today.toISOString().split("T")[0];
    }

    form.addEventListener("focusin", function () {
      if (!started) { started = true; track("contact_form_start"); }
    });

    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        if (field.value.trim() || field.hasAttribute("required")) validate(field);
      });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      fields.forEach(function (field) {
        if (!validate(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      /* Integração:
         1) troque ENDPOINT pelo seu formulário (Formspree, Basin, e-mail do hosting etc.)
         2) enquanto ENDPOINT for "", o site mostra a confirmação em modo demonstração. */
      var ENDPOINT = "";
      var payload = {};
      fields.forEach(function (f) { if (f.name) payload[f.name] = f.value; });

      function done() {
        form.style.display = "none";
        if (success) {
          success.classList.add("is-visible");
          success.setAttribute("tabindex", "-1");
          success.focus();
        }
        track("contact_form_submit", { event_type: payload.tipo || "" });
      }

      if (!ENDPOINT) { done(); return; }

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      }).then(done).catch(function () {
        var alerta = document.getElementById("form-erro");
        if (alerta) alerta.hidden = false;
      });
    });
  }

  /* -------------------------------------------- 7. Eventos de conversão */
  function initTracking() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-track]");
      if (!el) return;
      var name = el.getAttribute("data-track");
      var label = el.getAttribute("data-track-label") || "";
      if (name) track(name, { label: label, page: location.pathname });
    });
  }

  /* ---------------------------------------------------------- 8. Rodapé */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  onReady(function () {
    loadGA4();
    initHeader();
    initActiveNav();
    initReveal();
    initLightbox();
    initForm();
    initTracking();
    initYear();
    track("site_ready", { page: location.pathname });
  });
})();
