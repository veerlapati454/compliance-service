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

    // 5. Shared helper — turns a horizontally-scrollable flex track into a
    //    button-controlled carousel. Used by both "Trending This Week" and
    //    "Meet Our Writers" (replaces the old scroll-jacked / auto-marquee
    //    behavior, which is what was causing cards to slide as the page
    //    scrolled, and was inflating page height with empty space).
    function initArrowCarousel({ track, prevBtn, nextBtn, progressBar }) {
        if (!track) return;

        function cardStep() {
            const firstCard = track.firstElementChild;
            if (!firstCard) return track.clientWidth;
            const styles = getComputedStyle(track);
            const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
            return firstCard.getBoundingClientRect().width + gap;
        }

        function updateState() {
            const maxScroll = Math.max(track.scrollWidth - track.clientWidth, 0);
            if (prevBtn) prevBtn.disabled = track.scrollLeft <= 1;
            if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll - 1;
            if (progressBar) {
                const pct = maxScroll > 0 ? (track.scrollLeft / maxScroll) * 100 : 0;
                progressBar.style.width = `${pct}%`;
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                track.scrollBy({ left: -cardStep(), behavior: "smooth" });
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                track.scrollBy({ left: cardStep(), behavior: "smooth" });
            });
        }

        track.addEventListener("scroll", () => {
            requestAnimationFrame(updateState);
        }, { passive: true });

        window.addEventListener("resize", () => requestAnimationFrame(updateState));
        updateState();
    }

    // 5a. Trending This Week carousel
    initArrowCarousel({
        track: document.getElementById("ins-trend-track"),
        prevBtn: document.getElementById("ins-trend-prev"),
        nextBtn: document.getElementById("ins-trend-next"),
        progressBar: document.getElementById("ins-trend-progress-bar")
    });

    // 5b. Meet Our Writers carousel
    initArrowCarousel({
        track: document.getElementById("ins-writers-track"),
        prevBtn: document.getElementById("ins-writers-prev"),
        nextBtn: document.getElementById("ins-writers-next")
    });

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
            }, 300);
        });
    });

});