/* ═══════════════════════════════════════════════════
   SOLVANA — Interactions & Animations
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initScrollReveal();
    initFloatingTags();
    initStatsCounter();
    initContactForm();
    initSmoothScroll();
    initHeroParticles();
});

/* ─── Navbar Hide/Show on Scroll ─── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    navbar.classList.add('navbar--hidden');
                } else {
                    navbar.classList.remove('navbar--hidden');
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
}

/* ─── Mobile Menu ─── */
function initMobileMenu() {
    const burger = document.getElementById('burgerBtn');
    const menu = document.getElementById('mobileMenu');
    const links = menu.querySelectorAll('.mobile-menu__link');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* ─── Scroll Reveal (IntersectionObserver) ─── */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* ─── Floating Tags Parallax on Mousemove ─── */
function initFloatingTags() {
    const hero = document.querySelector('.hero');
    const tags = document.querySelectorAll('.hero__floating-tags .floating-tag');

    if (!hero || tags.length === 0) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        tags.forEach((tag, i) => {
            const speed = (i + 1) * 8;
            const tx = x * speed;
            const ty = y * speed;
            tag.style.transform = `translate(${tx}px, ${ty}px)`;
        });
    });

    hero.addEventListener('mouseleave', () => {
        tags.forEach(tag => {
            tag.style.transform = '';
        });
    });
}

/* ─── Stats Counter Animation ─── */
function initStatsCounter() {
    const counters = document.querySelectorAll('.stats__item-count');
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                counters.forEach(counter => animateCounter(counter));
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.getElementById('stats');
    if (statsSection) observer.observe(statsSection);
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const startTime = performance.now();
    const startVal = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startVal + (target - startVal) * easeOut);

        el.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/* ─── Contact Form Multi-Step & Submission ─── */
function initContactForm() {
    const step1 = document.getElementById('contactStep1');
    const step2 = document.getElementById('contactStep2');
    const success = document.getElementById('contactSuccess');
    const nextBtn = document.getElementById('contactNext');
    const backBtn = document.getElementById('contactBack');
    const form = document.getElementById('contactForm');

    if (!form) return;

    // Next button — validate step 1 then show step 2
    nextBtn.addEventListener('click', () => {
        const name = document.getElementById('contactName');
        const email = document.getElementById('contactEmail');
        const phone = document.getElementById('contactPhone');

        // Basic validation
        if (!name.value.trim()) { name.focus(); return; }
        if (!email.value.trim() || !email.validity.valid) { email.focus(); return; }
        if (!phone.value.trim()) { phone.focus(); return; }

        // Animate transition
        step1.style.opacity = '0';
        step1.style.transform = 'translateX(-30px)';
        setTimeout(() => {
            step1.classList.remove('contact__step--active');
            step1.style.opacity = '';
            step1.style.transform = '';
            step2.classList.add('contact__step--active');
            step2.style.opacity = '0';
            step2.style.transform = 'translateX(30px)';
            requestAnimationFrame(() => {
                step2.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                step2.style.opacity = '1';
                step2.style.transform = 'translateX(0)';
            });
        }, 300);
    });

    // Back button
    backBtn.addEventListener('click', () => {
        step2.classList.remove('contact__step--active');
        step1.classList.add('contact__step--active');
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('contactSubmit');
        submitBtn.textContent = '↳ Sending...';
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            phone: document.getElementById('contactPhone').value,
            service: document.getElementById('contactService').value,
            message: document.getElementById('contactMessage').value,
        };

        try {
            // Send via Formspree
            const response = await fetch('https://formspree.io/f/xwpkvwyj', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showSuccess();
            } else {
                // Fallback: open mailto
                fallbackMailto(formData);
            }
        } catch (err) {
            // Fallback: open mailto
            fallbackMailto(formData);
        }
    });

    function showSuccess() {
        step2.classList.remove('contact__step--active');
        success.classList.add('contact__step--active');
    }

    function fallbackMailto(data) {
        const subject = encodeURIComponent(`New Inquiry: ${data.service}`);
        const body = encodeURIComponent(
            `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nService: ${data.service}\n\nMessage:\n${data.message}`
        );
        window.open(`mailto:nedal.grewo@solvana-ly.com?subject=${subject}&body=${body}`, '_self');
        showSuccess();
    }
}

/* ─── Smooth Scroll for Nav Links ─── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const offset = 80; // navbar height
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/* ═══════════════════════════════════════════════════
   INTERACTIVE DOT LIGHTNING ⚡ — Hero Background
   ═══════════════════════════════════════════════════ */
function initHeroParticles() {
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ─── Configuration ───
    const CONFIG = {
        dotRadius: 2.3,
        dotSpacing: 6,         // pixel gap between sampled dots
        mouseRadius: 100,      // influence radius in px
        mouseForce: 55,        // max push distance
        springBack: 0.07,      // how fast dots return (0-1)
        damping: 0.87,         // velocity damping
        dotColor: '26, 26, 26',
        baseOpacity: 0.5,
        floatAmplitude: 8,     // floating bob in px
        floatSpeed: 0.0012,    // floating speed
    };

    let width, height, dpr;
    let mouseX = -9999, mouseY = -9999;
    let particles = [];
    let animId;
    let time = 0;

    // ─── Dot class ───
    class Dot {
        constructor(x, y, opacity) {
            this.baseX = x;
            this.baseY = y;
            this.opacity = opacity;
            this.screenX = 0;
            this.screenY = 0;
            this.dx = 0;
            this.dy = 0;
            this.vx = 0;
            this.vy = 0;
            this.phase = Math.random() * Math.PI * 2;
        }

        update(cx, cy, floatY, t) {
            const microFloat = Math.sin(t * 2 + this.phase) * 1.5;
            this.screenX = cx + this.baseX + this.dx;
            this.screenY = cy + this.baseY + floatY + microFloat + this.dy;

            const ddx = this.screenX - mouseX;
            const ddy = this.screenY - mouseY;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy);

            if (dist < CONFIG.mouseRadius && dist > 0) {
                const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseForce;
                const angle = Math.atan2(ddy, ddx);
                this.vx += Math.cos(angle) * force * 0.12;
                this.vy += Math.sin(angle) * force * 0.12;
            }

            this.vx -= this.dx * CONFIG.springBack;
            this.vy -= this.dy * CONFIG.springBack;
            this.vx *= CONFIG.damping;
            this.vy *= CONFIG.damping;
            this.dx += this.vx;
            this.dy += this.vy;
        }

        draw(ctx) {
            const displacement = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            const glowBoost = Math.min(displacement / 25, 0.45);
            const finalOpacity = Math.min(this.opacity + glowBoost, 0.9);

            ctx.beginPath();
            ctx.arc(this.screenX, this.screenY, CONFIG.dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${CONFIG.dotColor}, ${finalOpacity})`;
            ctx.fill();
        }
    }

    // ─── Sample ⚡ shape from offscreen canvas ───
    function sampleShape() {
        const size = Math.round(Math.min(width, height) * 0.65);
        const offCanvas = document.createElement('canvas');
        offCanvas.width = size;
        offCanvas.height = size;
        const offCtx = offCanvas.getContext('2d');

        // Draw the ⚡ emoji
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.font = `${size * 0.85}px serif`;
        offCtx.fillText('⚡', size / 2, size / 2);

        const imageData = offCtx.getImageData(0, 0, size, size);
        const data = imageData.data;
        const dots = [];
        const spacing = CONFIG.dotSpacing;
        const halfSize = size / 2;

        for (let y = 0; y < size; y += spacing) {
            for (let x = 0; x < size; x += spacing) {
                const idx = (y * size + x) * 4;
                const alpha = data[idx + 3];

                if (alpha > 30) {
                    const px = x - halfSize;
                    const py = y - halfSize;
                    const opacity = CONFIG.baseOpacity * (alpha / 255);
                    dots.push(new Dot(px, py, opacity));
                }
            }
        }

        return dots;
    }

    // ─── Resize ───
    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        CONFIG.mouseRadius = Math.min(width, height) * 0.1;
    }

    // ─── Mouse tracking ───
    function onMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }

    function onMouseLeave() {
        mouseX = -9999;
        mouseY = -9999;
    }

    function onTouchMove(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
    }

    function onTouchEnd() {
        mouseX = -9999;
        mouseY = -9999;
    }

    // ─── Animation Loop ───
    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += CONFIG.floatSpeed;

        const floatY = Math.sin(time) * CONFIG.floatAmplitude;
        const cx = width / 2;
        const cy = height / 2;

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(cx, cy, floatY, time);
            particles[i].draw(ctx);
        }

        animId = requestAnimationFrame(animate);
    }

    // ─── Visibility: pause when off-screen ───
    const heroSection = document.getElementById('hero');
    const visibilityObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!animId) animate();
            } else {
                if (animId) {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            }
        });
    }, { threshold: 0.05 });
    visibilityObs.observe(heroSection);

    // ─── Init ───
    resize();
    particles = sampleShape();

    window.addEventListener('resize', () => {
        resize();
        particles = sampleShape();
    });

    heroSection.addEventListener('mousemove', onMouseMove);
    heroSection.addEventListener('mouseleave', onMouseLeave);
    heroSection.addEventListener('touchmove', onTouchMove, { passive: true });
    heroSection.addEventListener('touchend', onTouchEnd);

    animate();
}
