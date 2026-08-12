document.addEventListener("DOMContentLoaded", () => {

    // 1. Hero entry animation
    const heroReveals = document.querySelectorAll(".nf-section .reveal-text");
    setTimeout(() => heroReveals.forEach(el => el.classList.add("active")), 150);

    const navbarPill = document.getElementById("navbar-pill-element");
    if (navbarPill) setTimeout(() => navbarPill.parentElement.classList.add("active"), 100);

    // 2. Go back button — uses browser history when there's somewhere to go
    //    back to, otherwise falls back to the homepage so the button always
    //    does something useful instead of dead-ending on this page.
    const backBtn = document.getElementById("nf-back-btn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = "index.html";
            }
        });
    }

    // 3. Background glow — light scroll-linked parallax, mirrors other pages
    const nfBg = document.getElementById("nf-bg");
    let bgTicking = false;
    function updateBgParallax() {
        if (!nfBg) return;
        const scrollY = window.scrollY || window.pageYOffset;
        nfBg.style.transform = `translateY(${scrollY * 0.1}px)`;
        bgTicking = false;
    }
    window.addEventListener("scroll", () => {
        if (!bgTicking) {
            requestAnimationFrame(updateBgParallax);
            bgTicking = true;
        }
    }, { passive: true });
    updateBgParallax();

    // 4. Floating icons — subtle pointer-driven parallax on top of their
    //    CSS drift animation, desktop only.
    const floatEls = document.querySelectorAll(".nf-float");
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (floatEls.length && supportsHover) {
        window.addEventListener("mousemove", (e) => {
            const relX = e.clientX / window.innerWidth - 0.5;
            const relY = e.clientY / window.innerHeight - 0.5;

            floatEls.forEach(el => {
                const depth = parseFloat(el.getAttribute("data-float-depth")) || 15;
                const moveX = relX * depth;
                const moveY = relY * depth;
                el.style.setProperty("--nf-parallax-x", `${moveX}px`);
                el.style.setProperty("--nf-parallax-y", `${moveY}px`);
                el.style.marginLeft = moveX + "px";
                el.style.marginTop = moveY + "px";
            });
        }, { passive: true });
    }

});