import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Initial Grid Loading Animation
function initIntro() {
    const tl = gsap.timeline();

    // 1. Grid Lines Expand
    tl.from('.line.v-line', {
        scaleY: 0,
        transformOrigin: "top center",
        duration: 1.5,
        stagger: 0.1,
        ease: "power3.inOut"
    })
        .from('.line.h-line', {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.5,
            stagger: 0.1,
            ease: "power3.inOut"
        }, "<") // Start at same time

        // 2. Crosshairs & Tech Decos Fade In
        .from('.crosshair, .tech-dash, .tech-box', {
            opacity: 0,
            duration: 0.5,
            stagger: 0.05
        }, "-=0.5")

        // 3. Hero Yellow Blocks Slide In
        .from('.floating-yellow-block', {
            x: 100,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        })
        .from('.header-block', {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.8,
            ease: "expo.out"
        }, "<")

        // 4. Hero Image Reveal
        .from('.main-image-wrapper', {
            clipPath: "inset(0 100% 0 0)", // Wipe effect
            duration: 1.2,
            ease: "power4.out"
        }, "-=0.8")

        // 5. Typography Scramble/Fade
        .from('.hero-content .big-num, .hero-content .small-text', {
            y: 20,
            opacity: 0,
            stagger: 0.1
        }, "-=0.5")
        .from('.floating-yellow-block h1, .date-header', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1
        }, "-=0.8");
}

// Speakers Section Scroll Animation
function initSpeakers() {
    // Red Grid Reveal
    gsap.from('.complex-grid-bg', {
        opacity: 0,
        scale: 1.1,
        duration: 1.5,
        scrollTrigger: {
            trigger: '.speakers-section',
            start: "top 70%",
        }
    });

    // Yellow Strip Slide
    gsap.from('.yellow-strip-content', {
        width: "0%",
        duration: 1,
        ease: "power2.inOut",
        scrollTrigger: {
            trigger: '.sf-middle-row',
            start: "top 80%",
        }
    });

    // Images Stagger
    gsap.from('.sf-img-wrapper', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: '.sf-middle-row',
            start: "top 80%",
        }
    });

    // "BEST SPEAKERS" Title
    gsap.from('.best-box', {
        x: -50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
            trigger: '.sf-title-area',
            start: "top 85%",
        }
    });
    gsap.from('.speakers-text', {
        x: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
            trigger: '.sf-title-area',
            start: "top 85%",
        }
    });
}

// Clients Section Scroll Animation
function initClients() {
    // Top Markers drop down
    gsap.from('.cs-top-markers .data-point, .cs-tr-label', {
        y: -50,
        opacity: 0,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.clients-section',
            start: "top 60%",
        }
    });

    // Yellow Backdrop Slide
    gsap.from('.yellow-backdrop', {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
            trigger: '.cs-content-grid',
            start: "top 70%",
        }
    });

    // Main Image Reveal
    gsap.from('.cs-main-image', {
        clipPath: "inset(0 0 0 100%)", // Wipe from left
        duration: 1.2,
        ease: "power2.inOut",
        delay: 0.2,
        scrollTrigger: {
            trigger: '.cs-content-grid',
            start: "top 70%",
        }
    });

    // Title & Logo
    gsap.from('.cs-title', {
        opacity: 0,
        y: 20,
        duration: 1,
        scrollTrigger: {
            trigger: '.cs-left-col',
            start: "top 70%",
        }
    });

    // Decoding effect for Logo
    gsap.from('.cs-logo', {
        text: "0000", // Will need TextPlugin for real scramble, simpler fallback:
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: '.cs-logo',
            start: "top 80%",
        }
    });
}

// Mouse Parallax for Grid
function initParallax() {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        gsap.to('.bg-grid', {
            x: x,
            y: y,
            duration: 1,
            ease: "power2.out"
        });

        gsap.to('.floating-yellow-block, .best-box', {
            x: -x * 0.5, // Move slightly opposite
            y: -y * 0.5,
            duration: 1.5,
            ease: "power2.out",
            overwrite: "auto"
        });
    });
}

// Run Animations
document.addEventListener('DOMContentLoaded', () => {
    initIntro();
    initSpeakers();
    initClients();
    initParallax();
});
