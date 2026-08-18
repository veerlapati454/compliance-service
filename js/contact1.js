document.addEventListener("DOMContentLoaded", () => {
    console.log("[contact.js] loaded — steps arrows build v3");


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

    // 5. "What happens next" steps panel.
    //    Desktop: scroll-driven horizontal translate inside a sticky
    //    section (original effect), re-measured after web fonts load
    //    so the travel distance is accurate.
    //    Mobile (<=768px): native horizontal swipe/snap-scroll instead
    //    of scroll-jacking, since translating a track based on vertical
    //    scroll fights touch input and mobile viewport-height changes.
    const stepsOuter = document.getElementById("ctc-steps-outer");
    const stepsTrack = document.getElementById("ctc-steps-track");
    const stepsProgressBar = document.getElementById("ctc-steps-progress-bar");
    const stepsPrevBtn = document.getElementById("ctc-steps-prev");
    const stepsNextBtn = document.getElementById("ctc-steps-next");
    const stepCards = stepsTrack ? stepsTrack.querySelectorAll(".ctc-step-card") : [];

    const stepsMediaQuery = window.matchMedia("(max-width: 768px)");
    let stepsMode = null; // "mobile" | "desktop"
    let desktopScrollHandler = null;
    let desktopResizeHandler = null;
    let mobileScrollHandler = null;
    let currentStepIndex = 0; // tracks which card is "active" on mobile

    // ---- Desktop: scroll-jacked horizontal translate ----
    function sizeStepsSection() {
        if (!stepsOuter || !stepsTrack) return;
        const trackWidth = stepsTrack.scrollWidth;
        const viewportW = window.innerWidth;
        const travel = Math.max(trackWidth - viewportW + 160, 0);
        stepsOuter.style.height = `calc(100vh + ${travel}px)`;
        stepsOuter.dataset.travel = travel;
    }

    function updateStepsArrowState(progress) {
        if (!stepsPrevBtn || !stepsNextBtn) return;
        stepsPrevBtn.disabled = progress <= 0.001;
        stepsNextBtn.disabled = progress >= 0.999;
    }

    function updateStepsScroll() {
        if (!stepsOuter || !stepsTrack) return;
        const travel = parseFloat(stepsOuter.dataset.travel || "0");
        if (travel <= 0) {
            updateStepsArrowState(1);
            return;
        }

        const rect = stepsOuter.getBoundingClientRect();
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / travel, 0), 1);

        stepsTrack.style.transform = `translateX(${-progress * travel}px)`;
        if (stepsProgressBar) stepsProgressBar.style.width = `${progress * 100}%`;
        updateStepsArrowState(progress);
    }

    // Moves the page scroll position by one "card step" worth of travel so the
    // arrows feel like discrete steps rather than a full jump to start/end.
    function stepByArrow(direction) {
        if (!stepsOuter) return;
        const travel = parseFloat(stepsOuter.dataset.travel || "0");
        if (travel <= 0) return;

        const stepCount = Math.max(stepCards.length - 1, 1);
        const stepAmount = travel / stepCount;

        window.scrollBy({ top: direction * stepAmount, behavior: "smooth" });
    }

    function teardownDesktopSteps() {
        if (desktopScrollHandler) window.removeEventListener("scroll", desktopScrollHandler);
        if (desktopResizeHandler) window.removeEventListener("resize", desktopResizeHandler);
        desktopScrollHandler = null;
        desktopResizeHandler = null;
        if (stepsOuter) {
            stepsOuter.style.height = "";
            delete stepsOuter.dataset.travel;
        }
        if (stepsTrack) stepsTrack.style.transform = "";
    }

    function setupDesktopSteps() {
        sizeStepsSection();
        // Re-measure once web fonts finish loading — on first paint fonts
        // may still be swapping in, which under-measures scrollWidth and
        // cuts the travel distance short (the bug that hid the 4th card).
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => sizeStepsSection());
        }
        desktopResizeHandler = sizeStepsSection;
        desktopScrollHandler = () => requestAnimationFrame(updateStepsScroll);

        window.addEventListener("resize", desktopResizeHandler);
        window.addEventListener("scroll", desktopScrollHandler, { passive: true });
        updateStepsScroll();
    }

    // ---- Mobile: native horizontal swipe / snap-scroll ----
    // Card-to-card distance in px, used only for the progress bar / index sync.
    function getStepCardStride() {
        if (stepCards.length < 1) return 280;
        const first = stepCards[0].getBoundingClientRect();
        if (stepCards.length > 1) {
            const second = stepCards[1].getBoundingClientRect();
            return Math.round(second.left - first.left) || (first.width + 32);
        }
        return Math.round(first.width + 32);
    }

    function updateMobileStepsUI() {
        if (!stepsTrack) return;
        const maxScroll = stepsTrack.scrollWidth - stepsTrack.clientWidth;
        const stride = getStepCardStride();

        // Keep currentStepIndex in sync with real (possibly manual/swiped) scroll position.
        currentStepIndex = stride > 0
            ? Math.round(stepsTrack.scrollLeft / stride)
            : 0;
        currentStepIndex = Math.max(0, Math.min(currentStepIndex, stepCards.length - 1));

        if (stepsPrevBtn) stepsPrevBtn.disabled = stepsTrack.scrollLeft <= 4;
        if (stepsNextBtn) stepsNextBtn.disabled = maxScroll <= 0 || stepsTrack.scrollLeft >= maxScroll - 4;
        if (stepsProgressBar) {
            const pct = maxScroll > 0 ? (stepsTrack.scrollLeft / maxScroll) * 100 : 0;
            stepsProgressBar.style.width = `${pct}%`;
        }
    }

    // Measures the target card's real current position relative to the
    // track's real current position (via getBoundingClientRect, not
    // offsetLeft/stride math) and scrolls exactly that distance. This is
    // immune to any mismatch between our assumptions and the actual
    // rendered layout — it just moves the container by however far the
    // card visibly is from the edge right now.
    function scrollStepsByCard(direction) {
        if (!stepsTrack || !stepCards.length) return;

        currentStepIndex = Math.max(0, Math.min(currentStepIndex + direction, stepCards.length - 1));
        const targetCard = stepCards[currentStepIndex];
        if (!targetCard) return;

        const trackRect = stepsTrack.getBoundingClientRect();
        const cardRect = targetCard.getBoundingClientRect();
        const delta = cardRect.left - trackRect.left;

        const maxScroll = stepsTrack.scrollWidth - stepsTrack.clientWidth;
        const target = Math.max(0, Math.min(stepsTrack.scrollLeft + delta, maxScroll));

        stepsTrack.scrollTo({ left: target, behavior: "smooth" });
        setTimeout(updateMobileStepsUI, 400);
    }

    function teardownMobileSteps() {
        if (mobileScrollHandler && stepsTrack) {
            stepsTrack.removeEventListener("scroll", mobileScrollHandler);
        }
        mobileScrollHandler = null;
        if (stepsProgressBar) stepsProgressBar.style.width = "0%";
    }

    function setupMobileSteps() {
        if (!stepsTrack) return;
        mobileScrollHandler = () => requestAnimationFrame(updateMobileStepsUI);
        stepsTrack.addEventListener("scroll", mobileScrollHandler, { passive: true });
        updateMobileStepsUI();
    }

    // ---- Mode switch: swap setups when crossing the breakpoint ----
    function applyStepsMode() {
        if (!stepsOuter || !stepsTrack) return;
        const wantMobile = stepsMediaQuery.matches;
        const nextMode = wantMobile ? "mobile" : "desktop";
        if (nextMode === stepsMode) return;

        if (stepsMode === "desktop") teardownDesktopSteps();
        if (stepsMode === "mobile") teardownMobileSteps();

        stepsMode = nextMode;
        if (stepsMode === "mobile") {
            setupMobileSteps();
        } else {
            setupDesktopSteps();
        }
    }

    if (stepsOuter && stepsTrack) {
        applyStepsMode();

        if (stepsMediaQuery.addEventListener) {
            stepsMediaQuery.addEventListener("change", applyStepsMode);
        } else if (stepsMediaQuery.addListener) {
            // Safari <14 fallback
            stepsMediaQuery.addListener(applyStepsMode);
        }

        if (stepsPrevBtn) {
            stepsPrevBtn.addEventListener("click", () => {
                if (stepsMediaQuery.matches) scrollStepsByCard(-1);
                else stepByArrow(-1);
            });
        }
        if (stepsNextBtn) {
            stepsNextBtn.addEventListener("click", () => {
                if (stepsMediaQuery.matches) scrollStepsByCard(1);
                else stepByArrow(1);
            });
        }
    }

    // 6. Contact form — field focus affordance + input restriction + validation
    document.querySelectorAll(".ctc-form-field input, .ctc-form-field select, .ctc-form-field textarea")
        .forEach(field => {
            field.addEventListener("focus", () => field.closest(".ctc-form-field").classList.add("is-focused"));
            field.addEventListener("blur", () => field.closest(".ctc-form-field").classList.remove("is-focused"));
        });

    // 6a. Letters-only live filtering for Name and Company.
    //     Allows letters, spaces, apostrophes and hyphens (for names like
    //     "Mary-Jane" or "O'Brien"); strips digits/symbols as the user types.
    const LETTERS_ONLY_PATTERN = /[^A-Za-z\s'-]/g;
    function restrictToLetters(input) {
        input.addEventListener("input", () => {
            const cleaned = input.value.replace(LETTERS_ONLY_PATTERN, "");
            if (cleaned !== input.value) {
                const cursor = input.selectionStart - (input.value.length - cleaned.length);
                input.value = cleaned;
                if (typeof cursor === "number") {
                    input.setSelectionRange(Math.max(cursor, 0), Math.max(cursor, 0));
                }
            }
            clearFieldError(input);
        });
        // Block paste content that isn't letters-only before it lands.
        input.addEventListener("paste", (e) => {
            const pasted = (e.clipboardData || window.clipboardData).getData("text");
            if (LETTERS_ONLY_PATTERN.test(pasted)) {
                e.preventDefault();
                const cleanedPaste = pasted.replace(LETTERS_ONLY_PATTERN, "");
                document.execCommand("insertText", false, cleanedPaste);
            }
        });
    }

    const ctcNameInput = document.getElementById("ctc-name");
    const ctcCompanyInput = document.getElementById("ctc-company");
    if (ctcNameInput) restrictToLetters(ctcNameInput);
    if (ctcCompanyInput) restrictToLetters(ctcCompanyInput);

    // 6b. Field-level error helpers
    function setFieldError(input) {
        const fieldWrap = input.closest(".ctc-form-field");
        if (fieldWrap) fieldWrap.classList.add("has-error");
    }
    function clearFieldError(input) {
        const fieldWrap = input.closest(".ctc-form-field");
        if (fieldWrap) fieldWrap.classList.remove("has-error");
    }

    function isValidEmail(value) {
        // Standard, pragmatic email shape check: something@something.tld
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }
    function isLettersOnly(value) {
        return /^[A-Za-z\s'-]+$/.test(value.trim());
    }

    // 6c. Full contact-form validation on submit
    const contactForm = document.getElementById("ctc-contact-form");
    const contactSuccess = document.getElementById("ctc-form-success");

    if (contactForm) {
        const emailInput = document.getElementById("ctc-email");
        const messageInput = document.getElementById("ctc-message");

        [ctcNameInput, emailInput, ctcCompanyInput, messageInput].forEach(input => {
            if (!input) return;
            input.addEventListener("input", () => clearFieldError(input));
        });

        contactForm.addEventListener("submit", (e) => {
            let isValid = true;
            if (contactSuccess) contactSuccess.classList.remove("is-visible");

            // Name — required, letters only
            if (ctcNameInput) {
                const val = ctcNameInput.value.trim();
                if (!val || !isLettersOnly(val)) {
                    setFieldError(ctcNameInput);
                    isValid = false;
                } else {
                    clearFieldError(ctcNameInput);
                }
            }

            // Company — optional, but if filled must be letters only
            if (ctcCompanyInput) {
                const val = ctcCompanyInput.value.trim();
                if (val && !isLettersOnly(val)) {
                    setFieldError(ctcCompanyInput);
                    isValid = false;
                } else {
                    clearFieldError(ctcCompanyInput);
                }
            }

            // Work email — required, valid email shape
            if (emailInput) {
                const val = emailInput.value.trim();
                if (!val || !isValidEmail(val)) {
                    setFieldError(emailInput);
                    isValid = false;
                } else {
                    clearFieldError(emailInput);
                }
            }

            // Message — required
            if (messageInput) {
                const val = messageInput.value.trim();
                if (!val) {
                    setFieldError(messageInput);
                    isValid = false;
                } else {
                    clearFieldError(messageInput);
                }
            }

            if (!isValid) {
                e.preventDefault();
                const firstError = contactForm.querySelector(".ctc-form-field.has-error input, .ctc-form-field.has-error textarea");
                if (firstError) firstError.focus();
                return;
            }

            // Demo context: this form posts to a placeholder action (404.html).
            // Show an inline success confirmation instead of letting it navigate away.
            e.preventDefault();
            if (contactSuccess) contactSuccess.classList.add("is-visible");
        });
    }

    // 7. "Talk it through live" wellness form — visible email validation
    // 7. "Talk it through live" wellness form — visible email validation
(function setupWellnessFormValidation() {
    const wellnessForm = document.getElementById("ctc-wellness-form");
    const wellnessEmailInput = document.getElementById("ctc-wellness-email");

    if (!wellnessForm || !wellnessEmailInput) return;

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    // Remove error while typing
    wellnessEmailInput.addEventListener("input", () => {
        wellnessForm.classList.remove("has-error");
    });

    wellnessForm.addEventListener("submit", (e) => {

        // Stop normal form submission first
        e.preventDefault();

        const val = wellnessEmailInput.value.trim();

        // Invalid email
        if (!val || !isValidEmail(val)) {
            wellnessForm.classList.add("has-error");
            wellnessEmailInput.focus();
            return;
        }

        // Valid email
        wellnessForm.classList.remove("has-error");

        // Redirect to 404.html
        window.location.href = "404.html";
    });

})();
    // 8. FAQ accordion — one item open at a time, height animated via scrollHeight
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