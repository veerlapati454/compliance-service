document.addEventListener("DOMContentLoaded", () => {

    // 1. Hero entry animation
    const heroReveals = document.querySelectorAll(".ctc-hero .reveal-text");
    setTimeout(() => heroReveals.forEach(el => el.classList.add("active")), 150);

    const navbarPill = document.getElementById("navbar-pill-element");
    if (navbarPill) setTimeout(() => navbarPill.parentElement.classList.add("active"), 100);

    // 2. Generic scroll reveal for .reveal-scroll-up elements (form col, map, faq list, etc.)
    const scrollRevealItems = document.querySelectorAll(".reveal-scroll-up");
    const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    scrollRevealItems.forEach(item => scrollRevealObserver.observe(item));

    // 3. Staggered reveal for the contact-info cards
    (function staggerInfoCards() {
        const grid = document.getElementById("ctc-info-grid");
        if (!grid) return;
        const cards = grid.querySelectorAll(".ctc-stagger-item");
        const cardObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cards.forEach((card, i) => {
                        setTimeout(() => card.classList.add("card-visible"), i * 110);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
        cardObserver.observe(grid);
    })();

    // 4. Hero background glow — light scroll-linked parallax
    const heroBg = document.getElementById("ctc-hero-bg");
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

    // 5. Scroll-driven horizontal "What happens next" steps panel.
    //    Same pin-and-translate pattern as the insights "Trending" section:
    //    the outer section's height maps 1:1 scroll px to track travel px,
    //    while the inner panel stays pinned and the track slides sideways.
    const stepsOuter = document.getElementById("ctc-steps-outer");
    const stepsTrack = document.getElementById("ctc-steps-track");
    const stepsProgressBar = document.getElementById("ctc-steps-progress-bar");

    function sizeStepsSection() {
        if (!stepsOuter || !stepsTrack) return;
        const trackWidth = stepsTrack.scrollWidth;
        const viewportW = window.innerWidth;
        const travel = Math.max(trackWidth - viewportW + 160, 0);
        stepsOuter.style.height = `calc(100vh + ${travel}px)`;
        stepsOuter.dataset.travel = travel;
    }

    function updateStepsScroll() {
        if (!stepsOuter || !stepsTrack) return;
        const travel = parseFloat(stepsOuter.dataset.travel || "0");
        if (travel <= 0) return;

        const rect = stepsOuter.getBoundingClientRect();
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / travel, 0), 1);

        stepsTrack.style.transform = `translateX(${-progress * travel}px)`;
        if (stepsProgressBar) stepsProgressBar.style.width = `${progress * 100}%`;
    }

    if (stepsOuter && stepsTrack) {
        sizeStepsSection();
        window.addEventListener("resize", sizeStepsSection);
        window.addEventListener("scroll", () => {
            requestAnimationFrame(updateStepsScroll);
        }, { passive: true });
        updateStepsScroll();
    }

    // 6. Contact form — small "focused" affordance on the parent field
    //    so labels/borders can react without relying on :focus-within alone.
    document.querySelectorAll(".ctc-form-field input, .ctc-form-field select, .ctc-form-field textarea")
        .forEach(field => {
            field.addEventListener("focus", () => field.closest(".ctc-form-field").classList.add("is-focused"));
            field.addEventListener("blur", () => field.closest(".ctc-form-field").classList.remove("is-focused"));
        });

    // 7. FAQ accordion — one item open at a time, height animated via scrollHeight
    (function setupFaqAccordion() {
        const faqItems = document.querySelectorAll(".ctc-faq-item");
        if (!faqItems.length) return;

        function setAnswerHeight(item, open) {
            const answer = item.querySelector(".ctc-faq-answer");
            const button = item.querySelector(".ctc-faq-question");
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
            const button = item.querySelector(".ctc-faq-question");
            button.addEventListener("click", () => {
                const isOpen = item.classList.contains("is-open");
                faqItems.forEach(other => setAnswerHeight(other, false));
                if (!isOpen) setAnswerHeight(item, true);
            });
        });

        const initiallyOpen = document.querySelector(".ctc-faq-item.is-open");
        if (initiallyOpen) setAnswerHeight(initiallyOpen, true);

        window.addEventListener("resize", () => {
            const openItem = document.querySelector(".ctc-faq-item.is-open");
            if (openItem) setAnswerHeight(openItem, true);
        });
    })();

});