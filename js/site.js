/* ============================================================
   ILUMINATO EVENTOS — site.js
   Interações: header, menu, reveal, parallax, lightbox,
   carrossel e aplicação dos dados configuráveis (content.js)
   ============================================================ */
(function () {
  'use strict';

  var cfg = window.ILUMINATO || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ----------------------------------------------------------
     1. Dados configuráveis
     ---------------------------------------------------------- */
  function waHref() {
    var base = 'https://wa.me/' + (cfg.whatsapp || '5555999357369');
    return cfg.whatsappMessage
      ? base + '?text=' + encodeURIComponent(cfg.whatsappMessage)
      : base;
  }

  function applyConfig() {
    document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
      el.href = waHref();
    });

    if (cfg.phoneRaw) {
      document.querySelectorAll('[data-tel]').forEach(function (el) {
        el.href = 'tel:' + String(cfg.phoneRaw).replace(/[^\d+]/g, '');
      });
    }

    if (cfg.phoneDisplay) {
      document.querySelectorAll('[data-phone]').forEach(function (el) {
        el.textContent = cfg.phoneDisplay;
      });
    }

    if (cfg.mapsQuery) {
      var mapUrl =
        'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(cfg.mapsQuery);
      document.querySelectorAll('[data-map]').forEach(function (el) {
        el.href = mapUrl;
      });
      var frame = document.querySelector('.loc__map iframe');
      if (frame) {
        frame.src =
          'https://www.google.com/maps?q=' +
          encodeURIComponent(cfg.mapsQuery) +
          '&output=embed';
      }
    }

    var social = cfg.social || {};
    document.querySelectorAll('[data-social]').forEach(function (el) {
      var url = social[el.getAttribute('data-social')];
      if (url) {
        el.href = url;
        var item = el.closest('[data-social-item]');
        if (item) item.hidden = false;
      }
    });

    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  applyConfig();

  /* ----------------------------------------------------------
     2. Header — fundo ao rolar + item ativo (scrollspy)
     ---------------------------------------------------------- */
  var header = document.querySelector('.site-header');

  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__link')
  );
  var spySections = navLinks
    .map(function (link) {
      return link.hash ? document.querySelector(link.hash) : null;
    })
    .filter(Boolean);

  if (spySections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.toggle(
                'is-active',
                link.hash === '#' + entry.target.id
              );
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    spySections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ----------------------------------------------------------
     3. Menu mobile
     ---------------------------------------------------------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu-mobile');
  var menuLastFocus = null;

  function openMenu() {
    if (!menu) return;
    menuLastFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(function () {
      menu.classList.add('is-open');
    });
    if (burger) burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var closeBtn = menu.querySelector('.menu-mobile__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.classList.remove('is-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      menu.hidden = true;
    }, 400);
    if (menuLastFocus && menuLastFocus.focus) menuLastFocus.focus();
  }

  if (burger && menu) {
    burger.addEventListener('click', openMenu);
    menu.querySelector('.menu-mobile__close').addEventListener('click', closeMenu);
    menu.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Presa de foco simples dentro do menu
    menu.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      var focusables = menu.querySelectorAll('a[href], button');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ----------------------------------------------------------
     4. Reveal on scroll
     ---------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     5. Parallax sutil (apenas desktop com mouse)
     ---------------------------------------------------------- */
  var heroMedia = document.querySelector('.hero__media');
  var ctaSection = document.querySelector('.cta-final');
  var ctaMedia = document.querySelector('.cta-final__media');
  var canParallax =
    !reduceMotion.matches &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    window.innerWidth > 1024;

  if (canParallax && (heroMedia || ctaMedia)) {
    var ticking = false;

    var updateParallax = function () {
      ticking = false;
      var y = window.scrollY;

      if (heroMedia && y < window.innerHeight * 1.4) {
        heroMedia.style.transform =
          'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
      }

      if (ctaMedia && ctaSection) {
        var rect = ctaSection.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          var progress =
            (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          ctaMedia.style.transform =
            'translate3d(0,' + ((progress - 0.5) * 64).toFixed(1) + 'px,0)';
        }
      }
    };

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateParallax);
        }
      },
      { passive: true }
    );
    updateParallax();
  }

  /* ----------------------------------------------------------
     6. Lightbox (grupos: galeria, depoimentos)
     ---------------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');

  if (lightbox) {
    var lbImg = lightbox.querySelector('.lightbox__img');
    var lbCaption = lightbox.querySelector('.lightbox__caption');
    var lbCounter = lightbox.querySelector('.lightbox__counter');
    var lbClose = lightbox.querySelector('.lightbox__close');
    var lbPrev = lightbox.querySelector('.lightbox__prev');
    var lbNext = lightbox.querySelector('.lightbox__next');
    var lbItems = [];
    var lbIndex = 0;
    var lbLastFocus = null;

    var lbShow = function (i) {
      if (!lbItems.length) return;
      lbIndex = (i + lbItems.length) % lbItems.length;
      var el = lbItems[lbIndex];
      var thumb = el.querySelector('img');
      lbImg.src = el.getAttribute('data-src');
      lbImg.alt = thumb ? thumb.alt : '';
      lbCaption.textContent = el.getAttribute('data-caption') || '';
      lbCounter.textContent = lbIndex + 1 + ' / ' + lbItems.length;
    };

    var lbOpen = function (trigger) {
      var group = trigger.getAttribute('data-lightbox');
      lbItems = Array.prototype.slice.call(
        document.querySelectorAll('[data-lightbox="' + group + '"]')
      );
      lbLastFocus = document.activeElement;
      lbShow(lbItems.indexOf(trigger));
      lightbox.hidden = false;
      requestAnimationFrame(function () {
        lightbox.classList.add('is-open');
      });
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    };

    var lbCloseFn = function () {
      if (lightbox.hidden) return;
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      window.setTimeout(function () {
        lightbox.hidden = true;
        lbImg.src = '';
      }, 350);
      if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus();
    };

    document.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.addEventListener('click', function () {
        lbOpen(el);
      });
    });

    lbClose.addEventListener('click', lbCloseFn);
    lbPrev.addEventListener('click', function () {
      lbShow(lbIndex - 1);
    });
    lbNext.addEventListener('click', function () {
      lbShow(lbIndex + 1);
    });
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) lbCloseFn();
    });

    // Teclado
    document.addEventListener('keydown', function (event) {
      if (!lightbox.hidden) {
        if (event.key === 'Escape') lbCloseFn();
        if (event.key === 'ArrowLeft') lbShow(lbIndex - 1);
        if (event.key === 'ArrowRight') lbShow(lbIndex + 1);
        if (event.key === 'Tab') {
          var focusables = lightbox.querySelectorAll('button');
          var first = focusables[0];
          var last = focusables[focusables.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
        return;
      }
      if (event.key === 'Escape') closeMenu();
    });

    // Swipe (mobile)
    var touchStartX = 0;
    lightbox.addEventListener(
      'touchstart',
      function (event) {
        touchStartX = event.changedTouches[0].clientX;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      'touchend',
      function (event) {
        var dx = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 55) lbShow(dx < 0 ? lbIndex + 1 : lbIndex - 1);
      },
      { passive: true }
    );
  }

  /* ----------------------------------------------------------
     7. Carrossel de depoimentos
     ---------------------------------------------------------- */
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(
      carousel.querySelectorAll('.testimonial')
    );
    var dotsWrap = carousel.querySelector('.carousel-dots');
    var viewport = carousel.querySelector('.testimonials__viewport');
    var current = 0;

    if (!slides.length || !dotsWrap) return;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Ver depoimento ' + (i + 1));
      dot.addEventListener('click', function () {
        go(i);
      });
      dotsWrap.appendChild(dot);
    });

    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
    }

    carousel
      .querySelector('[data-carousel-prev]')
      .addEventListener('click', function () {
        go(current - 1);
      });
    carousel
      .querySelector('[data-carousel-next]')
      .addEventListener('click', function () {
        go(current + 1);
      });

    carousel.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') go(current - 1);
      if (event.key === 'ArrowRight') go(current + 1);
    });

    // Swipe (mobile)
    var startX = 0;
    viewport.addEventListener(
      'touchstart',
      function (event) {
        startX = event.touches[0].clientX;
      },
      { passive: true }
    );
    viewport.addEventListener(
      'touchend',
      function (event) {
        var dx = event.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) go(dx < 0 ? current + 1 : current - 1);
      },
      { passive: true }
    );

    go(0);
  });
})();
