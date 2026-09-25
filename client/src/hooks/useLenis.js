import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Buttery smooth scrolling, GSAP-website style.
 * Mount this ONCE at the top of your app (e.g. in App.jsx / a root Layout),
 * NOT inside individual page components — otherwise every route change
 * creates + destroys a new Lenis instance and you'll get scroll jank.
 *
 * Usage in App.jsx:
 *   import { useLenis } from './hooks/useLenis';
 *   function App() {
 *     useLenis();
 *     return <YourRoutes />;
 *   }
 */
export function useLenis() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out, classic GSAP-site feel
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.1,
        });

        // keep ScrollTrigger in sync with Lenis's virtual scroll position
        lenis.on('scroll', ScrollTrigger.update);

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        const rafId = requestAnimationFrame(raf);

        // ScrollTrigger normally listens to the native scroll event; since Lenis
        // takes over scrolling, tell ScrollTrigger to use Lenis's scroll value instead.
        ScrollTrigger.scrollerProxy(document.body, {
            scrollTop(value) {
                if (arguments.length) {
                    lenis.scrollTo(value, { immediate: true });
                }
                return lenis.animatedScroll ?? window.scrollY;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
        });

        ScrollTrigger.addEventListener('refresh', () => lenis.resize());
        ScrollTrigger.refresh();

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            ScrollTrigger.removeEventListener('refresh', () => lenis.resize());
        };
    }, []);
}

/**
 * Magnetic hover effect for buttons/CTAs — the little "pull toward the cursor"
 * wow-effect you see on GSAP agency sites. Attach the returned ref to any
 * motion.button / button / Box.
 */
export function useMagnetic(strength = 0.35) {
    const ref = { current: null };
    return function attachMagnetic(node) {
        if (ref.current === node) return;
        ref.current = node;
        if (!node) return;

        const xTo = gsap.quickTo(node, 'x', { duration: 0.5, ease: 'power3' });
        const yTo = gsap.quickTo(node, 'y', { duration: 0.5, ease: 'power3' });

        const onMove = (e) => {
            const r = node.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * strength);
            yTo((e.clientY - r.top - r.height / 2) * strength);
        };
        const onLeave = () => { xTo(0); yTo(0); };

        node.addEventListener('mousemove', onMove);
        node.addEventListener('mouseleave', onLeave);
    };
}