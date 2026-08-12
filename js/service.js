document.addEventListener("DOMContentLoaded", () => {

    // 1. Hero entry animation (mirrors home page hero reveal pattern)
    const heroReveals = document.querySelectorAll(".svc-hero .reveal-text");
    setTimeout(() => {
        heroReveals.forEach(el => el.classList.add("active"));
    }, 150);

    const navbarPill = document.getElementById("navbar-pill-element");
    if (navbarPill) {
        setTimeout(() => navbarPill.parentElement.classList.add("active"), 100);
    }

    // 2. Scroll reveal for all .reveal-scroll-up elements on this page
    const scrollRevealItems = document.querySelectorAll(".reveal-scroll-up");
    const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    scrollRevealItems.forEach(item => scrollRevealObserver.observe(item));

    // 3. Staggered reveal for service catalog cards
    const svcCards = document.querySelectorAll(".svc-card");
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("active"), i * 90);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    svcCards.forEach(card => cardObserver.observe(card));

    // 4. Staggered reveal for process timeline steps
    const svcSteps = document.querySelectorAll(".svc-step");
    const stepObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("active"), i * 110);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    svcSteps.forEach(step => stepObserver.observe(step));

    // 5. Service card "Explore" buttons — scroll to comparison table and
    //    highlight the matching row, so exploring a service leads somewhere useful.
    const svcCardLinks = document.querySelectorAll(".svc-card-link");
    const serviceToTagText = {
        soc2: "SOC 2",
        iso27001: "ISO 27001",
        gdpr: "GDPR",
        hipaa: "HIPAA",
        pcidss: "PCI DSS 4.0",
        vendor: null // no direct row — falls back to scrolling to the catalog card itself
    };

    svcCardLinks.forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-open");
            const tagText = serviceToTagText[key];

            if (tagText) {
                const tags = document.querySelectorAll(".svc-compare-tag");
                let matchedRow = null;
                tags.forEach(tag => {
                    if (tag.textContent.trim() === tagText) {
                        matchedRow = tag.closest("tr");
                    }
                });

                if (matchedRow) {
                    matchedRow.scrollIntoView({ behavior: "smooth", block: "center" });
                    matchedRow.style.transition = "background 0.4s ease";
                    matchedRow.style.background = "rgba(79, 70, 229, 0.12)";
                    setTimeout(() => { matchedRow.style.background = ""; }, 1600);
                    return;
                }
            }

            // Fallback: no comparison row for this service — just scroll to the pricing tiers
            const tiers = document.getElementById("svc-tiers-trigger");
            if (tiers) tiers.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    // 6. FAQ accordion — single-open behavior
    const faqItems = document.querySelectorAll(".svc-faq-item");
    faqItems.forEach(item => {
        const question = item.querySelector(".svc-faq-question");
        question.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            faqItems.forEach(other => {
                other.classList.remove("active");
                other.querySelector(".svc-faq-question").setAttribute("aria-expanded", "false");
            });

            if (!isActive) {
                item.classList.add("active");
                question.setAttribute("aria-expanded", "true");
            }
        });
    });

    // 7. Pricing tier hover tilt (subtle, matches home page's tactile feel)
    const tierCards = document.querySelectorAll(".svc-tier-card");
    tierCards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const midX = rect.width / 2;
            const midY = rect.height / 2;
            const rotateY = ((e.clientX - rect.left - midX) / midX) * 2;
            const rotateX = -((e.clientY - rect.top - midY) / midY) * 2;
            const scale = card.classList.contains("svc-tier-featured") ? 1.035 : 1;
            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
        });
        card.addEventListener("mouseleave", () => {
            const scale = card.classList.contains("svc-tier-featured") ? 1.035 : 1;
            card.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale(${scale})`;
        });
    });

});