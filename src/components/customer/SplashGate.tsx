'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from './SplashScreen';

// Bump the version suffix if you ever want the splash to replay for everyone
// after a rebrand (e.g. 'alhathlul_splash_seen_v2').
const SEEN_KEY = 'alhathlul_splash_seen_v1';

/**
 * Shows the brand splash only on the customer's FIRST visit — never again on
 * refresh or subsequent visits. The "seen" flag is persisted in localStorage.
 *
 * We start hidden and decide inside useEffect (client-only) so there's no SSR
 * hydration mismatch and no splash flash for returning customers.
 *
 * To instead show it once per browsing session (i.e. replay on a fresh visit
 * but not on refresh), swap `localStorage` for `sessionStorage` below.
 */
export function SplashGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setShow(true);
    } catch {
      /* storage blocked (private mode) — just skip the splash */
    }
  }, []);

  const finish = () => {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return <AnimatePresence>{show && <SplashScreen onFinish={finish} />}</AnimatePresence>;
}
