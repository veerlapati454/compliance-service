/* =========================================================
   Precept / Stackly — Site Interactivity
   Handles: scroll progress, navbar entrance + mobile menu,
   parallax backgrounds, scroll-reveal animations, animated
   stat counters, form "toast" feedback, devices/experts
   carousels, recommended-reads filtering, achievements panel,
   and tap-to-reveal benefit cards on touch devices.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    /* ---------------------------------------------------
       0. Small helpers
       --------------------------------------------------- */
    const $  = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------
       1. Scroll progress bar
       --------------------------------------------------- */
    const progressBar = $('#page-scroll-indicator');

    function updateScrollProgress() {
        if (!progressBar) return;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
    }

    /* ---------------------------------------------------
       2. Navbar: entrance animation + mobile hamburger menu
       --------------------------------------------------- */
    const navbarWrapper = $('.navbar-wrapper');
    const hamburgerBtn  = $('#nav-menu-hamburger');
    const navLinksPanel = $('#main-nav-links');
    const navItems       = $$('.nav-item');

    // Entrance animation on load
    window.requestAnimationFrame(() => {
        if (navbarWrapper) navbarWrapper.classList.add('active');
    });

    function closeMobileMenu() {
        if (!navLinksPanel || !hamburgerBtn) return;
        navLinksPanel.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }

    function toggleMobileMenu() {
        if (!navLinksPanel || !hamburgerBtn) return;
        const isOpen = navLinksPanel.classList.toggle('active');
        hamburgerBtn.classList.toggle('active', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }

    // Close the mobile drawer whenever a nav link is tapped
    navItems.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close mobile drawer on outside click
    document.addEventListener('click', (e) => {
        if (!navLinksPanel || !navLinksPanel.classList.contains('active')) return;
        const clickedInsideNav = navLinksPanel.contains(e.target) || (hamburgerBtn && hamburgerBtn.contains(e.target));
        if (!clickedInsideNav) closeMobileMenu();
    });

    // Close drawer automatically if viewport is resized back to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMobileMenu();
    });

    // Simple active-state swap + smooth "scroll to top" for the Home link
    navItems.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || '';
            if (href === '#home' || href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            }
            navItems.forEach(i => i.classList.remove('active'));
            link.classList.add('active');
        });
    });

    /* ---------------------------------------------------
       3. Parallax backgrounds (data-parallax-speed)
       --------------------------------------------------- */
    const parallaxEls = $$('[data-parallax-speed]');

    function updateParallax() {
        if (prefersReducedMotion || parallaxEls.length === 0) return;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        parallaxEls.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0;
            const rawOffset = scrollTop * speed;
            // Clamp the drift. Without this, the translated (position:absolute)
            // background layers keep drifting further down forever as the page
            // is scrolled, and since they sit in overflow:visible ancestors,
            // that growing transform inflates the document's actual scrollable
            // height — producing extra blank space below the footer that gets
            // worse the more the page is scrolled.
            const maxDrift = 120;
            const offset = Math.max(-maxDrift, Math.min(maxDrift, rawOffset));
            el.style.transform = `translate3d(0, ${offset}px, 0)`;
        });
    }

    /* ---------------------------------------------------
       4. Combined scroll handler (progress + parallax), rAF-throttled
       --------------------------------------------------- */
    let scrollTicking = false;
    function onScroll() {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                updateScrollProgress();
                updateParallax();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollProgress();
    updateParallax();

    /* ---------------------------------------------------
       5. Scroll-reveal animations (IntersectionObserver)

       IMPORTANT FIX: reveal-on-scroll classes start at opacity:0
       and only flip to visible once IntersectionObserver sees them
       enter the viewport. If the page loads (or is refreshed) while
       already scrolled partway down — which browsers frequently do
       via automatic scroll-position restoration — every section
       ABOVE the current scroll position never gets a chance to
       intersect, so it stays invisible FOREVER while still
       reserving its full layout height. That's exactly what produces
       a big empty gap between the navbar and whatever section
       happens to already be in view (e.g. the CTA banner).

       The fix: on load, do one synchronous pass and immediately
       reveal anything already at or above the fold (covers both
       "currently visible" and "already scrolled past" cases). Only
       genuinely below-the-fold elements get handed to the observer
       for the normal scroll-triggered reveal.
       --------------------------------------------------- */
    const revealSelectors = [
        '.reveal-fade', '.reveal-slide-up', '.reveal-text', '.reveal-image-right',
        '.reveal-scroll-up', '.reveal-right-to-left', '.reads-header'
    ];
    const revealEls = $$(revealSelectors.join(', '));

    function initScrollReveal() {
        if (!revealEls.length) return;

        if (!('IntersectionObserver' in window)) {
            revealEls.forEach(el => el.classList.add('active'));
            return;
        }

        const viewportBottom = window.innerHeight;
        const belowFold = [];

        revealEls.forEach(el => {
            if (el.classList.contains('active')) return; // already revealed
            const rect = el.getBoundingClientRect();
            // rect.top < viewportBottom is true both for elements currently
            // visible AND for elements already scrolled past (negative top).
            if (rect.top < viewportBottom) {
                el.classList.add('active');
            } else {
                belowFold.push(el);
            }
        });

        if (!belowFold.length) return;

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        belowFold.forEach(el => revealObserver.observe(el));
    }

    initScrollReveal();

    // Re-run once everything (images, fonts) has fully loaded, since layout
    // can shift after DOMContentLoaded and leave newly-revealed positions
    // out of sync. Also re-run on bfcache restore (back/forward navigation),
    // which restores scroll position without firing a normal load event.
    window.addEventListener('load', initScrollReveal);
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) initScrollReveal();
    });

    /* ---------------------------------------------------
       6. Animated stat counters (.stat-number[data-target])
       --------------------------------------------------- */
    const statNumbers = $$('.stat-number');

    function animateCount(el) {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        if (prefersReducedMotion) {
            el.textContent = target;
            return;
        }
        const duration = 1600;
        const startTime = performance.now();

        function tick(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(tick);
    }

    const statsCard = $('.stats-card-wide');

    if (statsCard && statsCard.getBoundingClientRect().top < window.innerHeight) {
        // Already visible or already scrolled past — animate immediately
        // instead of waiting for a scroll-triggered intersection that
        // will never come.
        statNumbers.forEach(animateCount);
    } else if ('IntersectionObserver' in window && statsCard) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(animateCount);
                    observer.disconnect();
                }
            });
        }, { threshold: 0.4 });

        statsObserver.observe(statsCard);
    } else {
        statNumbers.forEach(animateCount);
    }

    /* ---------------------------------------------------
       7. Toast helper + form submissions
       --------------------------------------------------- */
    function showToast(message) {
        let toast = $('.success-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'success-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '24px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            toast.style.background = '#312E81';
            toast.style.color = '#fff';
            toast.style.padding = '14px 26px';
            toast.style.borderRadius = '100px';
            toast.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
            toast.style.fontWeight = '600';
            toast.style.fontSize = '0.92rem';
            toast.style.boxShadow = '0 15px 40px rgba(49,46,129,0.3)';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            toast.style.zIndex = '10000';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 3200);
    }

    // Regulatory digest signup form
    const wellnessForm = $('#wellness-email-form');
    if (wellnessForm) {
        wellnessForm.addEventListener('submit', function (e) {
            const emailInput = $('#wellness-email-input', wellnessForm);
            if (emailInput && emailInput.value.trim()) {
                e.preventDefault();
                showToast("You're subscribed — the next digest lands in your inbox soon.");
                wellnessForm.reset();
            }
        });
    }

    /* ---------------------------------------------------
       8. Arrow-controlled carousels (Devices + Experts)
       --------------------------------------------------- */
    function setupCarousel(trackId, prevId, nextId) {
        const track = document.getElementById(trackId);
        const prevBtn = document.getElementById(prevId);
        const nextBtn = document.getElementById(nextId);
        if (!track || !prevBtn || !nextBtn) return;

        function scrollAmount() {
            const firstCard = track.firstElementChild;
            if (!firstCard) return 300;
            const cardWidth = firstCard.getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(track).gap) || 28;
            return (cardWidth + gap) * 1; // scroll one card at a time
        }

        prevBtn.addEventListener('click', () => {
            track.parentElement.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            track.parentElement.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
        });

        // Disable/enable arrow buttons at the ends
        function updateButtonStates() {
            const wrapper = track.parentElement;
            const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
            prevBtn.style.opacity = wrapper.scrollLeft <= 4 ? '0.4' : '1';
            nextBtn.style.opacity = wrapper.scrollLeft >= maxScroll - 4 ? '0.4' : '1';
        }
        updateButtonStates();
        track.parentElement.addEventListener('scroll', updateButtonStates, { passive: true });
        window.addEventListener('resize', updateButtonStates);
    }

    setupCarousel('devices-track', 'devices-prev-btn', 'devices-next-btn');
    setupCarousel('experts-track', 'experts-prev-btn', 'experts-next-btn');

    /* ---------------------------------------------------
       9. Recommended Reads — filter tabs
       --------------------------------------------------- */
    const readsTabs  = $$('.reads-tab');
    const readsCards = $$('.reads-card');

    if (readsTabs.length && readsCards.length) {
        // Give cards their initial visible state so the reveal transition can run
        readsCards.forEach(card => card.classList.add('card-visible'));

        readsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.getAttribute('data-filter');

                readsTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                readsCards.forEach(card => {
                    const matches = filter === 'all' || card.getAttribute('data-category') === filter;
                    if (matches) {
                        card.classList.remove('card-hidden');
                        // restart the reveal transition
                        card.classList.remove('card-visible');
                        requestAnimationFrame(() => card.classList.add('card-visible'));
                    } else {
                        card.classList.remove('card-visible');
                        card.classList.add('card-hidden');
                    }
                });
            });
        });
    }

    /* ---------------------------------------------------
       10. Achievements interactive panel
       Each year now carries BOTH its blurb text and its own
       photo, so clicking a year swaps the image (previously
       only the text updated and the photo never changed).
       --------------------------------------------------- */
    const achievItems    = $$('.achiev-item');
    const achievDisplay  = $('#achievDisplay');
    const achievYearEl   = $('#achievYear');
    const achievPillYear = $('#achievPillYear');
    const achievDescEl   = $('#achievDesc');
    const achievPhotoEl  = $('#achievPhoto');

    const achievDescriptions = {
        '2011': {
            text: 'Recognised by the AICPA as an approved SOC 2 readiness partner for growth-stage technology companies.',
            image: '../assets/cc84.webp'
        },
        '2016': {
            text: 'Certified as an ISO 27001 implementation partner, supporting ISMS builds through to external certification audits.',
            image: '../assets/cc85.webp'
        },
        '2020': {
            text: 'Honoured with a GDPR Readiness Innovation Award for cutting client data-mapping time across the industry.',
            image: '../assets/cc86.webp'
        },
        '2024': {
            text: 'Named Best Compliance Automation Platform for our continuous control-monitoring engine.',
            image: '../assets/cc87.webp'
        }
    };

    achievItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('active')) return;

            achievItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const year = item.querySelector('.achiev-item-year')?.textContent.trim();
            if (!year) return;

            const data = achievDescriptions[year];

            if (achievDisplay) achievDisplay.classList.add('is-fading');
            if (achievPhotoEl) achievPhotoEl.classList.add('switching');

            setTimeout(() => {
                if (achievYearEl) achievYearEl.textContent = year;
                if (achievPillYear) achievPillYear.textContent = year;
                if (achievDescEl && data) achievDescEl.textContent = data.text;
                if (achievPhotoEl && data) achievPhotoEl.src = data.image;
                if (achievDisplay) achievDisplay.classList.remove('is-fading');
                if (achievPhotoEl) achievPhotoEl.classList.remove('switching');
            }, prefersReducedMotion ? 0 : 220);
        });
    });

    /* ---------------------------------------------------
       11. Benefit cards — tap-to-reveal on touch devices
       --------------------------------------------------- */
    const benefitWraps = $$('.benefit-wrap');
    const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    if (isTouchDevice && benefitWraps.length) {
        benefitWraps.forEach(wrap => {
            wrap.addEventListener('click', () => {
                const alreadyTapped = wrap.classList.contains('tapped');
                benefitWraps.forEach(w => w.classList.remove('tapped'));
                if (!alreadyTapped) wrap.classList.add('tapped');
            });
        });
    }

});