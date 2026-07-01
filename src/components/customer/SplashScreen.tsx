'use client';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { BrandLogo } from '@/components/common/BrandLogo';

const TOTAL_MS = 3000;

/**
 * "First Light on Fresh" — a 3-second brand splash. Ambient teal-ink glow,
 * a warm spark, the mark settling with a single spring, a light sweep, then
 * the tagline — before it fades into Home. Honours reduced-motion.
 *
 * Purely visual; the caller (SplashGate) owns the "show once" logic and the
 * onFinish handoff.
 */
export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const t = useTranslations();
  const reduce = useReducedMotion();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Exit slightly before the hard cap, then hand off exactly on time.
    const exitAt = reduce ? 1200 : 2650;
    const total = reduce ? 1500 : TOTAL_MS;
    const t1 = setTimeout(() => setExiting(true), exitAt);
    const t2 = setTimeout(onFinish, total);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onFinish, reduce]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(120% 120% at 50% 40%, #063A34 0%, #02201D 72%)' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 1.03 : 1 }}
      transition={{ duration: 0.35, ease: [0.83, 0, 0.17, 1] }}
    >
      {/* Ambient breathing glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[420px] w-[420px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(15,190,160,0.30) 0%, rgba(15,190,160,0) 70%)' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={
          reduce
            ? { opacity: 0.5, scale: 1 }
            : { opacity: [0.35, 0.55, 0.4], scale: [0.95, 1.06, 1] }
        }
        transition={{ duration: 2.4, ease: 'easeInOut', repeat: reduce ? 0 : Infinity, repeatType: 'reverse' }}
      />

      {/* Warm "first light" spark */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute h-2 w-2 rounded-full"
          style={{ top: '37%', background: '#FFC24B', filter: 'blur(1px)' }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.6], y: [0, -22, -30] }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      )}

      {/* Mark — settle + light sweep */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: reduce ? 1 : 0.7, y: reduce ? 0 : 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={
          reduce
            ? { duration: 0.4, ease: 'easeOut' }
            : { delay: 0.4, type: 'spring', stiffness: 380, damping: 26 }
        }
      >
        <BrandLogo size="xl" priority className="drop-shadow-[0_8px_30px_rgba(15,190,160,0.25)]" />
        {!reduce && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)',
              mixBlendMode: 'screen',
            }}
            initial={{ x: '-120%' }}
            animate={{ x: '160%' }}
            transition={{ delay: 1.5, duration: 0.7, ease: 'easeInOut' }}
          />
        )}
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="mt-6 text-sm font-medium tracking-wide text-white/70"
        initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: reduce ? 0.3 : 1.7, duration: 0.5, ease: 'easeOut' }}
      >
        {t('common.splashTagline')}
      </motion.p>
    </motion.div>
  );
}
