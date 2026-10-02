/*
  GBS — Generation Builders & Suppliers
  Site interactions: header state, mobile nav, counters, FAQ, scroll-top,
  and initialisation of AOS / Swiper.
*/
(function () {
  "use strict";

  var body = document.body;

  /* Preloader */
  window.addEventListener("load", function () {
    var preloader = document.getElementById("preloader");
    if (preloader) preloader.classList.add("is-hidden");
  });

  /* Header scroll state */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");

    var scrollTopBtn = document.querySelector(".scroll-top");
    if (scrollTopBtn) {
      if (window.scrollY > 400) scrollTopBtn.classList.add("is-visible");
      else scrollTopBtn.classList.remove("is-visible");
    }
  }
  document.addEventListener("scroll", onScroll);
  onScroll();

  /* Mobile nav toggle */
  var toggle = document.querySelector(".mobile-nav-toggle");
  var navMenu = document.querySelector(".nav-menu");
  if (toggle && navMenu) {
    toggle.addEventListener("click", function () {
      navMenu.classList.toggle("is-open");
      var isOpen = navMenu.classList.contains("is-open");
      toggle.classList.toggle("bi-list", !isOpen);
      toggle.classList.toggle("bi-x", isOpen);
    });
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("is-open");
        toggle.classList.add("bi-list");
        toggle.classList.remove("bi-x");
      });
    });
    document.addEventListener("click", function (e) {
      if (!navMenu.classList.contains("is-open")) return;
      if (navMenu.contains(e.target) || toggle.contains(e.target)) return;
      navMenu.classList.remove("is-open");
      toggle.classList.add("bi-list");
      toggle.classList.remove("bi-x");
    });
  }

  /* Scroll to top */
  var scrollTopBtn = document.querySelector(".scroll-top");
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Animated stat counters (lightweight, no external dependency) */
  var counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
          var duration = 1400;
          var start = null;

          function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString();
          }
          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var answer = item.querySelector(".faq-a");
    if (!btn || !answer) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-a").style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove("is-open");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
  /* open first FAQ by default */
  var firstFaq = document.querySelector(".faq-item");
  if (firstFaq) {
    firstFaq.classList.add("is-open");
    var firstAnswer = firstFaq.querySelector(".faq-a");
    if (firstAnswer) firstAnswer.style.maxHeight = firstAnswer.scrollHeight + "px";
  }

  /* AOS — used sparingly, hero entrance only */
  if (window.AOS) {
    AOS.init({ duration: 700, once: true, offset: 40 });
  }

  /* GLightbox — gallery (present on pages with a .glightbox grid, e.g. about.html) */
  if (window.GLightbox) {
    GLightbox({ selector: ".glightbox", loop: true });
  }

  /* Quote request form — posts to Formspree (https://formspree.io), which
     emails the submission straight to GBS. No server of any kind needed;
     works from any static host, including local testing.
     SETUP: replace FORMSPREE_ENDPOINT below with your real form endpoint
     after creating a form at formspree.io — see SETUP-NOTIFICATIONS.md. */
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/xgavjwaj";

  var quoteForm = document.getElementById("quote-request-form");
  if (quoteForm) {
    var statusEl = document.createElement("div");
    statusEl.className = "form-status";
    statusEl.setAttribute("role", "status");
    quoteForm.appendChild(statusEl);

    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var submitBtn = quoteForm.querySelector('button[type="submit"]');
      var originalLabel = submitBtn.textContent;

      var payload = {
        _subject: "New GBS quote request",
        Name: (quoteForm.querySelector("#name") || {}).value || "",
        Phone: (quoteForm.querySelector("#phone") || {}).value || "",
        Material: (quoteForm.querySelector("#material") || {}).value || "",
        Quantity: (quoteForm.querySelector("#quantity") || {}).value || "",
        "Site Location": (quoteForm.querySelector("#location") || {}).value || "",
        Message: (quoteForm.querySelector("#message") || {}).value || "",
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      statusEl.className = "form-status";
      statusEl.textContent = "";

      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          return res.json();
        })
        .then(function () {
          statusEl.className = "form-status success";
          statusEl.textContent = "Thanks — we've received your request and will be in touch shortly.";
          quoteForm.reset();
        })
        .catch(function () {
          statusEl.className = "form-status error";
          statusEl.textContent = "Something went wrong sending your request. Please call or WhatsApp us using the details on the left instead.";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }

  /* Swiper — testimonials */
  if (window.Swiper) {
    new Swiper(".testimonials-swiper", {
      loop: true,
      speed: 600,
      autoplay: { delay: 6000, disableOnInteraction: false },
      slidesPerView: 1,
      spaceBetween: 24,
      pagination: { el: ".swiper-pagination", clickable: true },
      breakpoints: {
        768: { slidesPerView: 2 },
        1100: { slidesPerView: 3 }
      }
    });
  }
})();
