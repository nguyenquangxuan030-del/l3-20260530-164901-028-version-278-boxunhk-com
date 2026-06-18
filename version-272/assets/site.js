(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", opened);
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
        dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    show(0);
    start();
  }

  function initSearchForms() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-search-form]"), function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          input.focus();
          return;
        }
      });
    });
  }

  function initFilters() {
    var scope = document.querySelector("[data-card-scope]");
    if (!scope) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var sortSelect = document.querySelector("[data-sort-select]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function normalize(text) {
      return (text || "").toString().trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var year = yearSelect ? yearSelect.value : "";
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre"));
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || haystack.indexOf(keyword) > -1;
        var matchedYear = !year || cardYear === year;
        card.style.display = matchedKeyword && matchedYear ? "" : "none";
      });
    }

    function sortCards() {
      if (!sortSelect) {
        return;
      }
      var value = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        var ay = parseInt(a.getAttribute("data-year") || "0", 10);
        var by = parseInt(b.getAttribute("data-year") || "0", 10);
        var ai = parseInt(a.getAttribute("data-index") || "0", 10);
        var bi = parseInt(b.getAttribute("data-index") || "0", 10);
        if (value === "year-asc") {
          return ay - by || ai - bi;
        }
        if (value === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }
        return by - ay || ai - bi;
      });
      sorted.forEach(function (card) {
        scope.appendChild(card);
      });
      cards = sorted;
      applyFilter();
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-quick-filter]"), function (button) {
      button.addEventListener("click", function () {
        if (input) {
          input.value = button.getAttribute("data-quick-filter") || "";
          input.focus();
        }
        applyFilter();
      });
    });

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
    }
    sortCards();
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
  });
})();
