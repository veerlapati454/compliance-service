document.addEventListener("DOMContentLoaded", () => {
    // 1. Scroll Progress Indicator Bar
    const scrollProgress = document.getElementById("page-scroll-indicator");
    window.addEventListener("scroll", () => {
        const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScrollHeight > 0) {
            const percentage = (window.scrollY / totalScrollHeight) * 100;
            scrollProgress.style.width = `${percentage}%`;
        }
    });

    // 2. Mobile Menu Toggle Action
    const hamburger = document.getElementById("nav-menu-hamburger");
    const navLinks = document.getElementById("main-nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            const expanded = hamburger.getAttribute("aria-expanded") === "true";
            hamburger.setAttribute("aria-expanded", !expanded);
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
        });

        // Close mobile drawer when a link is clicked
        const navItems = document.querySelectorAll(".nav-item");
        navItems.forEach(item => {
            item.addEventListener("click", () => {
                navItems.forEach(nav => nav.classList.remove("active"));
                item.classList.add("active");
                
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
            });
        });
    }

    // 3. Load Entry Animations (Only for elements in initial viewport)
    const navbar = document.getElementById("navbar-pill-element");
    const heroCard = document.getElementById("hero-card-element");
    const doctorWrapper = document.getElementById("doctor-img-container");
    const heroTextReveals = document.querySelectorAll("#hero-card-element .reveal-text");
    const buttons = document.getElementById("anim-buttons");

    setTimeout(() => {
        if (navbar) navbar.parentElement.classList.add("active");
        if (heroCard) heroCard.classList.add("active");
        if (doctorWrapper) doctorWrapper.classList.add("active");
        
        heroTextReveals.forEach(reveal => {
            reveal.classList.add("active");
        });
        if (buttons) buttons.classList.add("active");
    }, 150);

    // 4. Mouse-Movement Parallax Effect on Background JPG Wrapper, Heart Glow, & Tools Section Image
    const parallaxElements = document.querySelectorAll("#hero-bg-img, #heart-glow-bg, #tools-bg-img");
    
    window.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX - window.innerWidth / 2;
        const mouseY = e.clientY - window.innerHeight / 2;
        
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute("data-parallax-speed") || 0.02);
            const xOffset = mouseX * speed;
            const yOffset = mouseY * speed;
            el.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });

    // 5. 3D Hover Tilt Animation (Extended to Wellness Card, Nurse Image, and Large Tool Cards)
    const tiltElements = [
        { el: document.getElementById("hero-card-element"), maxRotation: 4 },
        { el: document.getElementById("interactive-doctor-img"), maxRotation: 7 },
        { el: document.getElementById("wellness-card-bar"), maxRotation: 3 },
        { el: document.getElementById("interactive-nurse-img"), maxRotation: 6 },
        { el: document.getElementById("food-tool-card"), maxRotation: 3 },
        { el: document.getElementById("drug-tool-card"), maxRotation: 3 }
    ];

    tiltElements.forEach(item => {
        const element = item.el;
        if (!element) return;

        element.addEventListener("mousemove", (e) => {
            const rect = element.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            // Get mouse position relative to element center
            const mouseX = e.clientX - rect.left - width / 2;
            const mouseY = e.clientY - rect.top - height / 2;
            
            // Calculate tilt angle based on mouse distance from center
            const rotateX = -(mouseY / (height / 2)) * item.maxRotation;
            const rotateY = (mouseX / (width / 2)) * item.maxRotation;
            
            // Apply style with perspective
            element.style.transition = "transform 0.1s ease-out";
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.012, 1.012, 1.012)`;
        });

        element.addEventListener("mouseleave", () => {
            // Smoothly reset rotation on mouse leave
            element.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
            element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        });
    });

    // 6. Intersection Observer for Scroll Reveals & Counters (Supports Right-to-Left Slide-Ins)
    const scrollRevealItems = document.querySelectorAll(".reveal-scroll-up, .reveal-right-to-left");
    
    const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                
                // Stagger reveal text elements inside this container when it enters view
                const textRevealsInside = entry.target.querySelectorAll(".reveal-text");
                textRevealsInside.forEach(reveal => {
                    reveal.classList.add("active");
                });
                
                // If the stats bar is entering the viewport, start counting up
                if (entry.target.id === "statistics-card-bar") {
                    triggerCountUpAnimation();
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    });

    scrollRevealItems.forEach(item => {
        scrollRevealObserver.observe(item);
    });

    // 7. Dynamic Count Up Animation for Statistics
    function triggerCountUpAnimation() {
        const statCounters = document.querySelectorAll(".stat-number");
        
        statCounters.forEach(counter => {
            const targetValue = parseInt(counter.getAttribute("data-target"), 10);
            const duration = 1800; // Duration of count-up in milliseconds
            const startVal = 0;
            const startTime = performance.now();
            
            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function outQuad for natural slowdown
                const easeProgress = progress * (2 - progress);
                
                const currentValue = Math.floor(startVal + easeProgress * (targetValue - startVal));
                counter.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = targetValue;
                }
            }
            
            requestAnimationFrame(updateCounter);
        });
    }

    // 8. Reads Section — Filter Tab Interaction with smooth card animations
    const readsTabs  = document.querySelectorAll(".reads-tab");
    const readsCards = document.querySelectorAll(".reads-card");

    // Show all cards on initial load with stagger
    readsCards.forEach((card, i) => {
        setTimeout(() => card.classList.add("card-visible"), 120 * i);
    });

    readsTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            readsTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const filter = tab.getAttribute("data-filter");

            // First hide all with fade-out
            readsCards.forEach(card => {
                card.classList.remove("card-visible");
            });

            setTimeout(() => {
                let visibleIndex = 0;
                readsCards.forEach(card => {
                    const cat = card.getAttribute("data-category");
                    if (filter === "all" || cat === filter) {
                        card.classList.remove("card-hidden");
                        // Stagger fade-in
                        setTimeout(() => card.classList.add("card-visible"), 80 * visibleIndex);
                        visibleIndex++;
                    } else {
                        card.classList.add("card-hidden");
                    }
                });
            }, 320);
        });
    });

    // 9. Reads Header — Custom scroll reveal for split word animation
    const readsHeader = document.getElementById("reads-header");
    if (readsHeader) {
        const readsHeaderObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        readsHeaderObserver.observe(readsHeader);
    }

    // 10. Achievements Section — Interactive hover/click list
    const achievData = [
        {
            year: "2011",
            photo: "https://images.pexels.com/photos/7173038/pexels-photo-7173038.jpeg?auto=compress&cs=tinysrgb&w=700",
            desc: "Recognised by the AICPA as an approved SOC 2 readiness partner for growth-stage technology companies."
        },
        {
            year: "2016",
            photo: "https://images.pexels.com/photos/8470836/pexels-photo-8470836.jpeg?auto=compress&cs=tinysrgb&w=700",
            desc: "Certified to support comprehensive ISMS implementations and guide organizations through ISO 27001 external certification audits."
        },
        {
            year: "2020",
            photo: "https://images.pexels.com/photos/5380618/pexels-photo-5380618.jpeg?auto=compress&cs=tinysrgb&w=700",
            desc: "Awarded for pioneering automated data-mapping protocols that significantly cut client GDPR readiness overheads."
        },
        {
            year: "2024",
            photo: "https://images.pexels.com/photos/30004357/pexels-photo-30004357.jpeg?auto=compress&cs=tinysrgb&w=700",
            desc: "Recognized as the year's best compliance automation engine for real-time continuous control verification."
        }
    ];

    const achievItems    = document.querySelectorAll(".achiev-item");
    const achievDisplay  = document.getElementById("achievDisplay");
    const achievPhoto    = document.getElementById("achievPhoto");
    const achievYear     = document.getElementById("achievYear");
    const achievPillYear = document.getElementById("achievPillYear");
    const achievDesc     = document.getElementById("achievDesc");

    if (achievItems.length && achievDisplay) {
        achievItems.forEach((item) => {
            const activate = () => {
                const idx = parseInt(item.dataset.index, 10);
                if (item.classList.contains("active")) return;

                // Swap active state on list
                achievItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                // Fade the display panel
                achievDisplay.classList.add("is-fading");

                setTimeout(() => {
                    const d = achievData[idx];
                    if (!d) return;
                    if (achievPhoto)    { achievPhoto.src = d.photo; }
                    if (achievYear)     { achievYear.textContent = d.year; }
                    if (achievPillYear) { achievPillYear.textContent = d.year; }
                    if (achievDesc)     { achievDesc.textContent = d.desc; }
                    achievDisplay.classList.remove("is-fading");
                }, 350);
            };

            item.addEventListener("mouseenter", activate);
            item.addEventListener("click", activate);
        });
    }

    // 11. Benefits Section — Tap to reveal on mobile/tablet viewports
    const benefitCards = document.querySelectorAll(".benefit-wrap");
    benefitCards.forEach(card => {
        card.addEventListener("click", () => {
            // Remove tapped class from other cards first
            benefitCards.forEach(c => {
                if (c !== card) c.classList.remove("tapped");
            });
            card.classList.toggle("tapped");
        });
    });
});