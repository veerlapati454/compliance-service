/* ==========================================================================
   Compliance Loader — loading.js
   Injects and controls the white + blue compliance loading overlay
   ========================================================================== */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── 1. BUILD OVERLAY HTML ── */
    function buildLoader() {

        /* Particles */
        const particleData = [
            { left: '6%',  dur: '9s',   delay: '0s',   size: '5px' },
            { left: '16%', dur: '7.5s', delay: '1.2s', size: '4px' },
            { left: '27%', dur: '11s',  delay: '0.5s', size: '6px' },
            { left: '39%', dur: '8s',   delay: '2.1s', size: '3px' },
            { left: '51%', dur: '10s',  delay: '0.8s', size: '5px' },
            { left: '64%', dur: '7.8s', delay: '1.7s', size: '4px' },
            { left: '75%', dur: '9.6s', delay: '0.3s', size: '6px' },
            { left: '86%', dur: '8.4s', delay: '2.5s', size: '3px' },
            { left: '94%', dur: '11s',  delay: '1.0s', size: '5px' },
        ];
        const particles = prefersReducedMotion ? '' : particleData.map(p =>
            `<div class="cl-particle" style="left:${p.left};width:${p.size};height:${p.size};animation-duration:${p.dur};animation-delay:${p.delay};"></div>`
        ).join('');

        /* Floating compliance icons */
        const iconData = [
            { icon: 'fa-shield-halved',   left: '5%',  top: '12%', dur: '9s',   delay: '0s'   },
            { icon: 'fa-file-contract',   left: '87%', top: '18%', dur: '11s',  delay: '1.8s' },
            { icon: 'fa-scale-balanced',  left: '10%', top: '72%', dur: '10s',  delay: '3.2s' },
            { icon: 'fa-clipboard-check', left: '80%', top: '65%', dur: '8.5s', delay: '2.4s' },
            { icon: 'fa-lock',            left: '54%', top: '6%',  dur: '9s',   delay: '1.2s' },
            { icon: 'fa-key',             left: '22%', top: '83%', dur: '12s',  delay: '4.0s' },
            { icon: 'fa-building-shield', left: '69%', top: '10%', dur: '8s',   delay: '2.9s' },
            { icon: 'fa-user-shield',     left: '42%', top: '80%', dur: '10s',  delay: '3.6s' },
            { icon: 'fa-circle-check',    left: '92%', top: '44%', dur: '9.5s', delay: '1.5s' },
            { icon: 'fa-magnifying-glass',left: '2%',  top: '44%', dur: '8.5s', delay: '2.7s' },
        ];
        const iconHtml = prefersReducedMotion ? '' : iconData.map(d =>
            `<i class="cl-icon-float fa-solid ${d.icon}" style="left:${d.left};top:${d.top};animation-duration:${d.dur};animation-delay:${d.delay};font-size:1.7rem;"></i>`
        ).join('');

        /* Corner accent SVG */
        const cornerSvg = `
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" role="presentation" focusable="false">
                <rect x="33" y="0" width="12" height="80" rx="4" fill="url(#clCornerG1)"/>
                <rect x="0" y="33" width="80" height="12" rx="4" fill="url(#clCornerG2)"/>
                <defs>
                    <linearGradient id="clCornerG1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#60A5FA"/>
                        <stop offset="100%" stop-color="#1E3A8A"/>
                    </linearGradient>
                    <linearGradient id="clCornerG2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#60A5FA"/>
                        <stop offset="100%" stop-color="#1E3A8A"/>
                    </linearGradient>
                </defs>
            </svg>`;

        /* Build loader element */
        const loader = document.createElement('div');
        loader.id = 'compliance-loader';
        loader.setAttribute('role', 'status');
        loader.setAttribute('aria-live', 'polite');
        loader.setAttribute('aria-label', 'Loading Stackly Compliance');
        loader.innerHTML = `

            <div class="cl-bg"></div>
            <div class="cl-grid"></div>

            <div class="cl-blob cl-blob-1"></div>
            <div class="cl-blob cl-blob-2"></div>
            <div class="cl-blob cl-blob-3"></div>

            <div class="cl-particles">${particles}</div>
            <div class="cl-icons-bg">${iconHtml}</div>

            <div class="cl-corner cl-corner-tl">${cornerSvg}</div>
            <div class="cl-corner cl-corner-br">${cornerSvg}</div>

            <div class="cl-content">

                <!-- Logo -->
                <div class="cl-logo-wrap">
                    <img class="cl-logo-img"
                         src=""
                         onerror="this.style.display='none';var t=document.getElementById('cl-text-logo');if(t){t.style.display='block';}"
                         alt="Stackly Compliance Logo">
                    <span id="cl-text-logo" style="display:none;font-family:'Outfit',sans-serif;font-size:1.85rem;font-weight:800;color:#1E3A8A;letter-spacing:-0.02em;">STACKLY <span style="font-weight:500;">Compliance</span></span>
                    <span class="cl-brand-pill">Stackly Compliance</span>
                </div>

                <!-- Document scan visual -->
                <div class="cl-scan-wrap">
                    <div class="cl-scan-outer-ring"></div>

                    <svg class="cl-scan-arc-svg" viewBox="0 0 150 150" role="presentation" focusable="false">
                        <defs>
                            <linearGradient id="clArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%"   stop-color="#60A5FA"/>
                                <stop offset="100%" stop-color="#1E3A8A"/>
                            </linearGradient>
                        </defs>
                        <circle class="cl-arc-track" cx="75" cy="75" r="66"/>
                        <circle class="cl-arc-fill"  cx="75" cy="75" r="66"/>
                    </svg>

                    <div class="cl-doc-card">
                        <div class="cl-scan-beam"></div>
                        <div class="cl-doc-line"></div>
                        <div class="cl-doc-line short"></div>
                        <div class="cl-doc-line"></div>
                        <div class="cl-verify-badge"><i class="fa-solid fa-check"></i></div>
                    </div>
                </div>

                <!-- Checklist -->
                <div class="cl-checklist-wrap" id="cl-checklist">
                    <div class="cl-checklist-item" data-idx="0">
                        <span class="cl-check-icon"><i class="fa-solid fa-check"></i></span>
                        <span>Verifying credentials</span>
                    </div>
                    <div class="cl-checklist-item" data-idx="1">
                        <span class="cl-check-icon"><i class="fa-solid fa-check"></i></span>
                        <span>Loading compliance records</span>
                    </div>
                    <div class="cl-checklist-item" data-idx="2">
                        <span class="cl-check-icon"><i class="fa-solid fa-check"></i></span>
                        <span>Syncing regulatory data</span>
                    </div>
                </div>

                <!-- Progress bar -->
                <div class="cl-progress-wrap">
                    <div class="cl-progress-track">
                        <div class="cl-progress-fill"></div>
                    </div>
                </div>

                <!-- Status -->
                <p class="cl-status-text" id="cl-status">
                    Initialising
                    <span class="cl-dots"><span>.</span><span>.</span><span>.</span></span>
                </p>

            </div>

            <p class="cl-tagline">Your Compliance, Our Priority &nbsp;&middot;&nbsp; Stackly Compliance&#8482;</p>
        `;

        return loader;
    }

    /* ── 2. STATUS TEXT CYCLING ── */
    const messages = ['Initialising', 'Verifying access', 'Loading records', 'Almost ready', 'Welcome'];
    let msgIdx = 0;

    function cycleStatus(el) {
        if (!el) return;
        msgIdx = (msgIdx + 1) % messages.length;
        el.innerHTML = `${messages[msgIdx]} <span class="cl-dots"><span>.</span><span>.</span><span>.</span></span>`;
    }

    /* ── 3. CHECKLIST ITEM STAGGER ── */
    function runChecklist() {
        const items = document.querySelectorAll('#cl-checklist .cl-checklist-item');
        items.forEach((item, i) => {
            setTimeout(() => item.classList.add('done'), 900 + i * 550);
        });
    }

    /* ── 4. HIDE LOADER ── */
    function hideLoader(el) {
        if (!el) return;
        el.classList.add('loader-hide');
        const cleanup = () => { if (el.parentNode) el.parentNode.removeChild(el); };
        if (prefersReducedMotion) {
            cleanup();
        } else {
            setTimeout(cleanup, 700);
        }
    }

    /* ── 5. INIT ── */
    function init() {
        const loaderEl = buildLoader();
        document.body.style.overflow = 'hidden';
        document.body.prepend(loaderEl);

        const statusEl = document.getElementById('cl-status');
        const statusInterval = prefersReducedMotion
            ? null
            : setInterval(() => cycleStatus(statusEl), 660);

        if (!prefersReducedMotion) {
            runChecklist();
        } else {
            document.querySelectorAll('#cl-checklist .cl-checklist-item')
                .forEach(item => item.classList.add('done'));
        }

        const MIN_MS = prefersReducedMotion ? 600 : 2700;
        const t0 = Date.now();
        let finished = false;

        function done() {
            if (finished) return;
            finished = true;
            const wait = Math.max(0, MIN_MS - (Date.now() - t0));
            if (statusInterval) clearInterval(statusInterval);
            if (statusEl) statusEl.textContent = 'Welcome';
            setTimeout(() => {
                document.body.style.overflow = '';
                hideLoader(loaderEl);
            }, wait);
        }

        if (document.readyState === 'complete') {
            done();
        } else {
            window.addEventListener('load', done, { once: true });
            setTimeout(done, 5000);
        }
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    }

})();