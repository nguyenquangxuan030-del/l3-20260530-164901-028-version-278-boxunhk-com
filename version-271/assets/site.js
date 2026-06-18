document.addEventListener("DOMContentLoaded", function () {
  setupMenu();
  setupSearchForms();
  setupHero();
  setupFilters();
  setupPlayer();
});

function setupMenu() {
  var button = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", function () {
    panel.classList.toggle("is-open");
  });
}

function setupSearchForms() {
  var forms = document.querySelectorAll("[data-search-form]");
  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      if (query) {
        window.location.href = "./search.html?q=" + encodeURIComponent(query);
      } else {
        window.location.href = "./search.html";
      }
    });
  });
}

function setupHero() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(
    hero.querySelectorAll("[data-hero-slide]"),
  );
  var dots = Array.prototype.slice.call(
    hero.querySelectorAll("[data-hero-dot]"),
  );
  var prev = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  if (!slides.length) {
    return;
  }
  var current = 0;
  var timer = null;

  function activate(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle("is-active", itemIndex === current);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle("is-active", itemIndex === current);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      activate(current + 1);
    }, 5200);
  }

  if (prev) {
    prev.addEventListener("click", function () {
      activate(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      activate(current + 1);
      restart();
    });
  }

  dots.forEach(function (dot, itemIndex) {
    dot.addEventListener("click", function () {
      activate(itemIndex);
      restart();
    });
  });

  activate(0);
  restart();
}

function setupFilters() {
  var input = document.querySelector("[data-filter-input]");
  var select = document.querySelector("[data-sort-select]");
  var list = document.querySelector("[data-card-list]");
  var empty = document.querySelector("[data-empty-state]");
  if (!list) {
    return;
  }
  var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";

  if (input && initial) {
    input.value = initial;
  }

  function textOf(card) {
    return [
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.dataset.year,
    ]
      .join(" ")
      .toLowerCase();
  }

  function apply() {
    var query = input ? input.value.trim().toLowerCase() : "";
    var visible = 0;
    cards.forEach(function (card) {
      var matched = !query || textOf(card).indexOf(query) >= 0;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function sortCards() {
    var value = select ? select.value : "default";
    var sorted = cards.slice();
    if (value === "rating") {
      sorted.sort(function (a, b) {
        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
      });
    } else if (value === "views") {
      sorted.sort(function (a, b) {
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      });
    } else if (value === "year") {
      sorted.sort(function (a, b) {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
    } else {
      sorted.sort(function (a, b) {
        return cards.indexOf(a) - cards.indexOf(b);
      });
    }
    sorted.forEach(function (card) {
      list.appendChild(card);
    });
    cards = sorted;
    apply();
  }

  if (input) {
    input.addEventListener("input", apply);
  }
  if (select) {
    select.addEventListener("change", sortCards);
  }
  sortCards();
  apply();
}

function setupPlayer() {
  var shells = document.querySelectorAll("[data-player]");
  shells.forEach(function (shell) {
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var stream = shell.getAttribute("data-stream");
    if (!video || !stream) {
      return;
    }

    function bindStream() {
      if (video.dataset.ready === "1") {
        return;
      }
      video.dataset.ready = "1";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      bindStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  });
}
