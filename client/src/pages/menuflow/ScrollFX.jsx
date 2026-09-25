import { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useMagnetic } from '../../hooks/useLenis';
import { MF } from './mfTheme';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ─── Word-by-word scroll reveal for big headings ─── */
export function SplitHeading({ text, sx, component = 'h2' }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return undefined;
        const split = new SplitText(ref.current, { type: 'words', wordsClass: 'split-word' });
        gsap.set(split.words, { display: 'inline-block' });
        const tween = gsap.fromTo(split.words,
            { opacity: 0, yPercent: 130, rotate: 6 },
            { opacity: 1, yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.045, ease: 'back.out(1.6)', scrollTrigger: { trigger: ref.current, start: 'top 85%' } }
        );
        return () => { tween.scrollTrigger?.kill(); tween.kill(); split.revert(); };
    }, [text]);
    return <Typography ref={ref} component={component} sx={{ ...sx, overflow: 'hidden' }}>{text}</Typography>;
}

/* ─── Cursor-follow glow blob (desktop only) ─── */
export function CursorBlob() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' });
        const onMove = (e) => { xTo(e.clientX); yTo(e.clientY); };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);
    return (
        <Box ref={ref} sx={{
            position: 'fixed', top: -230, left: -230, width: 460, height: 460, borderRadius: '50%',
            background: `radial-gradient(circle, ${MF.primary}12 0%, transparent 72%)`,
            pointerEvents: 'none', zIndex: 3, display: { xs: 'none', md: 'block' },
        }} />
    );
}

/* ─── Real 3D mouse-tilt hook for images/cards/panels ─── */
export function useTilt3D(strength = 12) {
    const ref = useRef(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rX = useSpring(useTransform(my, [-0.5, 0.5], [strength, -strength]), { stiffness: 300, damping: 30 });
    const rY = useSpring(useTransform(mx, [-0.5, 0.5], [-strength, strength]), { stiffness: 300, damping: 30 });
    const handlers = {
        onMouseMove: (e) => {
            const r = ref.current?.getBoundingClientRect();
            if (!r) return;
            mx.set((e.clientX - r.left) / r.width - 0.5);
            my.set((e.clientY - r.top) / r.height - 0.5);
        },
        onMouseLeave: () => { mx.set(0); my.set(0); },
    };
    return { ref, rotateX: rX, rotateY: rY, handlers };
}

/* ─── Magnetic CTA button ─── */
export function MagneticButton({ children, onClick, variant = 'primary', type = 'button', disabled, style }) {
    const attachMagnetic = useMagnetic(0.3);
    const base = variant === 'primary'
        ? { background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', boxShadow: '0 10px 30px rgba(249,115,22,0.4)', border: 'none' }
        : { background: '#fff', color: MF.text, border: `1px solid rgba(249,115,22,0.2)`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };
    return (
        <motion.button
            ref={attachMagnetic}
            type={type}
            disabled={disabled}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            style={{ padding: '15px 34px', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: disabled ? 'wait' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: disabled ? 0.7 : 1, ...base, ...style }}
        >
            {children}
        </motion.button>
    );
}

/* ─── Reload-reliability fix ───────────────────────────────────────────
   Call this inside your page's gsap.context useEffect, right after you
   build your ScrollTrigger animations. It re-measures every trigger
   position once images/fonts finish loading (the #1 cause of "animation
   fires at the wrong scroll point on a fresh reload"), so behaviour is
   consistent every single time the page loads — not just when cached. */
export function useScrollTriggerReliability() {
    useEffect(() => {
        const handleLoad = () => ScrollTrigger.refresh();
        window.addEventListener('load', handleLoad);
        const t1 = setTimeout(() => ScrollTrigger.refresh(), 400);
        const t2 = setTimeout(() => ScrollTrigger.refresh(), 1200);
        return () => {
            window.removeEventListener('load', handleLoad);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);
}

export { gsap, ScrollTrigger };