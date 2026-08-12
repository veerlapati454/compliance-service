document.addEventListener("DOMContentLoaded", () => {

    // 1. Hero entry animation
    const heroReveals = document.querySelectorAll(".abt-hero .reveal-text");
    setTimeout(() => heroReveals.forEach(el => el.classList.add("active")), 150);

    const navbarPill = document.getElementById("navbar-pill-element");
    if (navbarPill) setTimeout(() => navbarPill.parentElement.classList.add("active"), 100);

    // 2. Generic scroll reveal for .reveal-scroll-up elements
    const scrollRevealItems = document.querySelectorAll(".reveal-scroll-up");
    const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                if (entry.target.id === "abt-stats-card") triggerStatsCountUp();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    scrollRevealItems.forEach(item => scrollRevealObserver.observe(item));

    // 3. Count-up animation for the company-stats band
    function triggerStatsCountUp() {
        const counters = document.querySelectorAll("#abt-stats-card .stat-number");
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

    // 4. Staggered card reveal — values grid + team grid, triggered once each
    //    grid enters the viewport (not per-card, so cards animate as a wave).
    function staggerGroup(selector, delayStep) {
        const container = document.querySelector(selector);
        if (!container) return;
        const cards = container.querySelectorAll(".abt-stagger-item");
        const groupObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cards.forEach((card, i) => {
                        setTimeout(() => card.classList.add("card-visible"), i * delayStep);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
        groupObserver.observe(container);
    }
    staggerGroup("#abt-values-grid", 110);
    staggerGroup("#abt-team-grid", 90);

    // 4B. "Why Precept" comparison — the two columns slide in from opposite
    //     sides, row by row, once the section is in view.
    (function staggerCompare() {
        const grid = document.getElementById("abt-compare-grid");
        if (!grid) return;
        const oldRows = grid.querySelectorAll(".abt-compare-old .abt-compare-row");
        const newRows = grid.querySelectorAll(".abt-compare-new .abt-compare-row");

        const compareObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    oldRows.forEach((row, i) => setTimeout(() => row.classList.add("card-visible"), i * 90));
                    newRows.forEach((row, i) => setTimeout(() => row.classList.add("card-visible"), 180 + i * 90));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
        compareObserver.observe(grid);
    })();

    // 4C. FAQ accordion — one item open at a time, height animated via
    //     scrollHeight so it works regardless of answer length.
    (function setupFaqAccordion() {
        const faqItems = document.querySelectorAll(".abt-faq-item");
        if (!faqItems.length) return;

        function setAnswerHeight(item, open) {
            const answer = item.querySelector(".abt-faq-answer");
            const button = item.querySelector(".abt-faq-question");
            if (open) {
                item.classList.add("is-open");
                button.setAttribute("aria-expanded", "true");
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                item.classList.remove("is-open");
                button.setAttribute("aria-expanded", "false");
                answer.style.maxHeight = "0px";
            }
        }

        faqItems.forEach(item => {
            const button = item.querySelector(".abt-faq-question");
            button.addEventListener("click", () => {
                const isOpen = item.classList.contains("is-open");
                faqItems.forEach(other => setAnswerHeight(other, false));
                if (!isOpen) setAnswerHeight(item, true);
            });
        });

        // Expand whichever item starts marked open (first question, by default)
        const initiallyOpen = document.querySelector(".abt-faq-item.is-open");
        if (initiallyOpen) setAnswerHeight(initiallyOpen, true);

        // Recalculate the open answer's height on resize (font reflow etc.)
        window.addEventListener("resize", () => {
            const openItem = document.querySelector(".abt-faq-item.is-open");
            if (openItem) setAnswerHeight(openItem, true);
        });
    })();

    // 5. Vertical timeline — rail fills as the "Our story" section scrolls
    //    through the viewport, tracking how far the reader has progressed.
    const timelineWrap = document.getElementById("abt-timeline-wrap");
    const timelineFill = document.getElementById("abt-timeline-fill");

    function updateTimelineFill() {
        if (!timelineWrap || !timelineFill) return;
        const rect = timelineWrap.getBoundingClientRect();
        const viewportH = window.innerHeight;

        // Start filling once the top of the timeline reaches ~80% down the
        // viewport, finish once the bottom passes ~30% up from the top.
        const startPoint = viewportH * 0.85;
        const endPoint = viewportH * 0.35;
        const total = rect.height + (startPoint - endPoint);
        const traveled = startPoint - rect.top;

        const progress = Math.min(Math.max(traveled / total, 0), 1);
        timelineFill.style.height = `${progress * 100}%`;
    }

    let timelineTicking = false;
    window.addEventListener("scroll", () => {
        if (!timelineTicking) {
            requestAnimationFrame(() => {
                updateTimelineFill();
                timelineTicking = false;
            });
            timelineTicking = true;
        }
    }, { passive: true });
    updateTimelineFill();

    // 6. Hero background glow — light scroll-linked parallax, mirrors insights page
    const heroBg = document.getElementById("abt-hero-bg");
    let bgTicking = false;
    function updateHeroParallax() {
        if (!heroBg) return;
        const scrollY = window.scrollY || window.pageYOffset;
        heroBg.style.transform = `translateY(${scrollY * 0.12}px)`;
        bgTicking = false;
    }
    window.addEventListener("scroll", () => {
        if (!bgTicking) {
            requestAnimationFrame(updateHeroParallax);
            bgTicking = true;
        }
    }, { passive: true });
    updateHeroParallax();

    // 7. Floating hero cards — subtle pointer-driven tilt/parallax, desktop only
    const heroVisual = document.getElementById("abt-hero-visual");
    const floatCards = document.querySelectorAll(".abt-float-card");
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (heroVisual && floatCards.length && supportsHover) {
        heroVisual.addEventListener("mousemove", (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
            const relY = (e.clientY - rect.top) / rect.height - 0.5;

            floatCards.forEach(card => {
                const depth = parseFloat(card.getAttribute("data-tilt-depth")) || 20;
                const moveX = relX * depth;
                const moveY = relY * depth;
                card.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });

        heroVisual.addEventListener("mouseleave", () => {
            floatCards.forEach(card => {
                card.style.transform = "translate(0px, 0px)";
            });
        });
    }

    // 8. Team flip cards — tap-to-flip fallback for touch devices
    //    (desktop relies on the CSS :hover / :focus-visible flip).
    const teamCards = document.querySelectorAll(".abt-team-card");
    if (!supportsHover) {
        teamCards.forEach(card => {
            card.addEventListener("click", () => {
                const alreadyFlipped = card.classList.contains("is-flipped");
                teamCards.forEach(c => c.classList.remove("is-flipped"));
                if (!alreadyFlipped) card.classList.add("is-flipped");
            });
        });
    }

});