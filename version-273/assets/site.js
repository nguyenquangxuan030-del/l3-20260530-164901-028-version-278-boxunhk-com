(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
    });

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    event.preventDefault();
                    window.location.href = "search.html";
                }
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === index;
                slide.classList.toggle("active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var scope = panel.parentElement;
            var list = scope ? scope.querySelector("[data-filter-list]") : null;
            if (!list) {
                return;
            }
            var keyword = panel.querySelector("[data-filter-keyword]");
            var category = panel.querySelector("[data-filter-category]");
            var type = panel.querySelector("[data-filter-type]");
            var reset = panel.querySelector("[data-filter-reset]");
            var empty = scope.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (keyword && initialQuery && !keyword.value) {
                keyword.value = initialQuery;
            }

            function includesText(haystack, needle) {
                return String(haystack || "").toLowerCase().indexOf(String(needle || "").toLowerCase()) !== -1;
            }

            function apply() {
                var q = keyword ? keyword.value.trim().toLowerCase() : "";
                var cat = category ? category.value : "";
                var typeValue = type ? type.value : "";
                var visible = 0;
                list.querySelectorAll(".movie-card, .rank-item").forEach(function (item) {
                    var text = [
                        item.dataset.title,
                        item.dataset.year,
                        item.dataset.type,
                        item.dataset.region,
                        item.dataset.category,
                        item.dataset.tags
                    ].join(" ");
                    var matchKeyword = !q || includesText(text, q);
                    var matchCategory = !cat || item.dataset.category === cat;
                    var matchType = !typeValue || item.dataset.type === typeValue;
                    var show = matchKeyword && matchCategory && matchType;
                    item.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [keyword, category, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    if (keyword) {
                        keyword.value = "";
                    }
                    if (category) {
                        category.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    apply();
                });
            }
            apply();
        });
    }
}());
