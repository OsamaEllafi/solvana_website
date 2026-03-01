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
    initHeroCanvas();
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
    const sun = document.getElementById('heroSun');

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

        // Sun parallax (slower, subtler)
        if (sun) {
            const sunTx = x * -15;
            const sunTy = y * -10;
            sun.style.transform = `translate(${sunTx}px, ${sunTy}px)`;
        }
    });

    hero.addEventListener('mouseleave', () => {
        tags.forEach(tag => {
            tag.style.transform = '';
        });
        if (sun) sun.style.transform = '';
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

/* ─── Interactive Hero Canvas (Solar Particles) ─── */
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let mouseX = -1000, mouseY = -1000;
    let particles = [];
    let animationId;

    const PARTICLE_COUNT = 60;
    const CONNECTION_DISTANCE = 120;
    const MOUSE_RADIUS = 150;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.3 - 0.1; // slight upward drift
            this.opacity = Math.random() * 0.5 + 0.2;
            this.hue = 35 + Math.random() * 20; // amber range
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.02 + Math.random() * 0.02;
        }

        update() {
            this.pulse += this.pulseSpeed;
            const pulseFactor = 0.7 + Math.sin(this.pulse) * 0.3;

            // Mouse interaction
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                this.x += dx * force * 0.02;
                this.y += dy * force * 0.02;
            }

            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap around
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;
            if (this.y < -10) this.y = height + 10;
            if (this.y > height + 10) this.y = -10;

            this.currentOpacity = this.opacity * pulseFactor;
            this.currentSize = this.size * pulseFactor;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.currentOpacity})`;
            ctx.fill();

            // Glow
            if (this.currentSize > 1.5) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.currentSize * 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.currentOpacity * 0.1})`;
                ctx.fill();
            }
        }
    }

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DISTANCE) {
                    const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(245, 166, 35, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        drawConnections();
        animationId = requestAnimationFrame(animate);
    }

    // Mouse tracking
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    // Performance: pause when not visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!animationId) animate();
            } else {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        });
    }, { threshold: 0.1 });

    observer.observe(canvas);

    window.addEventListener('resize', () => {
        resize();
    });

    init();
    animate();
}

