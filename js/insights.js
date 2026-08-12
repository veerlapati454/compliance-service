document.addEventListener("DOMContentLoaded", () => {

    // 1. Hero entry animation
    const heroReveals = document.querySelectorAll(".ins-hero .reveal-text");
    setTimeout(() => heroReveals.forEach(el => el.classList.add("active")), 150);

    const navbarPill = document.getElementById("navbar-pill-element");
    if (navbarPill) setTimeout(() => navbarPill.parentElement.classList.add("active"), 100);

    // 2. Generic scroll reveal for .reveal-scroll-up elements
    const scrollRevealItems = document.querySelectorAll(".reveal-scroll-up");
    const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                if (entry.target.id === "ins-stats-card") triggerStatsCountUp();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    scrollRevealItems.forEach(item => scrollRevealObserver.observe(item));

    // 3. Count-up animation for the reading-stats band
    function triggerStatsCountUp() {
        const counters = document.querySelectorAll("#ins-stats-card .stat-number");
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute("data-target"), 10);
            const duration = 1600;
            const start = performance.now();

            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = progress * (2 - progress);
                counter.textContent = Math.floor(eased * target);
                if (progress < 1) requestAnimationFrame(tick);
                else counter.textContent = target;
            }
            requestAnimationFrame(tick);
        });
    }

    // 4. Scroll-linked parallax — featured article image + hero background glow.
    //    Runs on scroll via rAF throttle; only touches elements currently near the viewport.
    const parallaxTargets = [
        { el: document.querySelector('[data-parallax-scroll]'), factor: 0.15 },
        { el: document.getElementById("ins-hero-bg"), factor: -0.08 }
    ].filter(t => t.el);

    let ticking = false;
    function updateParallax() {
        const viewportH = window.innerHeight;
        parallaxTargets.forEach(({ el, factor }) => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > viewportH) return; // skip offscreen elements
            const centerOffset = (rect.top + rect.height / 2) - viewportH / 2;
            el.style.transform = `translateY(${centerOffset * factor * -1}px)`;
        });
        ticking = false;
    }
    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
    updateParallax();

    // 5. Scroll-driven horizontal "Trending" panel.
    //    The outer section's height is set so that scrolling through it maps
    //    1:1 to the track's horizontal travel distance, while the sticky inner
    //    panel pins in place and the track translates sideways.
    const trendOuter = document.getElementById("ins-trend-outer");
    const trendTrack = document.getElementById("ins-trend-track");
    const trendProgressBar = document.getElementById("ins-trend-progress-bar");

    function sizeTrendSection() {
        if (!trendOuter || !trendTrack) return;
        const trackWidth = trendTrack.scrollWidth;
        const viewportW = window.innerWidth;
        const travel = Math.max(trackWidth - viewportW + 160, 0); // extra buffer for padding
        // Outer section height = 100vh (for the pin) + however far we need to scroll
        // to cover the horizontal travel distance (1 scroll px : 1 track px).
        trendOuter.style.height = `calc(100vh + ${travel}px)`;
        trendOuter.dataset.travel = travel;
    }

    function updateTrendScroll() {
        if (!trendOuter || !trendTrack) return;
        const travel = parseFloat(trendOuter.dataset.travel || "0");
        if (travel <= 0) return;

        const rect = trendOuter.getBoundingClientRect();
        // Progress is 0 when the section's top reaches the viewport top,
        // and 1 once we've scrolled past the full travel distance.
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / travel, 0), 1);

        trendTrack.style.transform = `translateX(${-progress * travel}px)`;
        if (trendProgressBar) trendProgressBar.style.width = `${progress * 100}%`;
    }

    if (trendOuter && trendTrack) {
        sizeTrendSection();
        window.addEventListener("resize", sizeTrendSection);
        window.addEventListener("scroll", () => {
            requestAnimationFrame(updateTrendScroll);
        }, { passive: true });
        updateTrendScroll();
    }

    // 6.1. Glossary flip cards — click/tap toggles flip (hover already handled in CSS for pointer devices)
    document.querySelectorAll(".glossary-card").forEach(card => {
        card.addEventListener("click", () => card.classList.toggle("is-flipped"));
    });

    // 6.2. Writer initials avatars — click/tap toggles flip to reveal specialty icon
    document.querySelectorAll(".expert-flip").forEach(flip => {
        flip.addEventListener("click", () => flip.classList.toggle("is-flipped"));
        flip.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                flip.classList.toggle("is-flipped");
            }
        });
    });

    // 6.3. Trend-score bars for the icon-variant trending cards — fill in once visible
    const trendScoreFills = document.querySelectorAll(".ins-trend-score-fill");
    if (trendScoreFills.length) {
        const scoreObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const pct = entry.target.getAttribute("data-percent") || "0";
                    requestAnimationFrame(() => { entry.target.style.width = `${pct}%`; });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        trendScoreFills.forEach(fill => scoreObserver.observe(fill));
    }

    // 7. Sticky category tabs — filter articles, same pattern as the home page reads section
    const insTabs = document.querySelectorAll("#ins-grid .reads-tab");
    const insCards = document.querySelectorAll("#ins-article-grid .reads-card");

    insCards.forEach((card, i) => {
        setTimeout(() => card.classList.add("card-visible"), 100 * i);
    });

    insTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            insTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            const filter = tab.getAttribute("data-filter");

            insCards.forEach(card => card.classList.remove("card-visible"));

            setTimeout(() => {
                let visibleIndex = 0;
                insCards.forEach(card => {
                    const cat = card.getAttribute("data-category");
                    if (filter === "all" || cat === filter) {
                        card.classList.remove("card-hidden");
                        setTimeout(() => card.classList.add("card-visible"), 70 * visibleIndex);
                        visibleIndex++;
                    } else {
                        card.classList.add("card-hidden");
                    }
                });
                // Recalculate trending-panel travel distance in case layout shifted height above it
                sizeTrendSection();
            }, 300);
        });
    });

});