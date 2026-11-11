"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { usePathname, useSearchParams } from "next/navigation";

import { NAVIGATION_PROGRESS_START } from "@/lib/navigation-progress";

const COMPLETE_DELAY_MS = 180;
const FAILSAFE_DELAY_MS = 15_000;

/**
 * App Router does not expose route-change events. This listens for internal
 * links, history navigation, and explicit imperative route changes, then
 * completes when the rendered URL changes.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const urlRef = useRef<string | null>(null);
  const pendingRef = useRef<boolean>(false);
  const trickleTimerRef = useRef<number | null>(null);
  const completeTimerRef = useRef<number | null>(null);
  const failsafeTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (trickleTimerRef.current !== null) window.clearInterval(trickleTimerRef.current);
    if (completeTimerRef.current !== null) window.clearTimeout(completeTimerRef.current);
    if (failsafeTimerRef.current !== null) window.clearTimeout(failsafeTimerRef.current);

    trickleTimerRef.current = null;
    completeTimerRef.current = null;
    failsafeTimerRef.current = null;
  }, []);

  const finish = useCallback(() => {
    if (!pendingRef.current) return;

    pendingRef.current = false;
    if (trickleTimerRef.current !== null) window.clearInterval(trickleTimerRef.current);
    if (failsafeTimerRef.current !== null) window.clearTimeout(failsafeTimerRef.current);
    trickleTimerRef.current = null;
    failsafeTimerRef.current = null;

    setProgress(100);
    completeTimerRef.current = window.setTimeout(() => {
      setProgress(0);
      completeTimerRef.current = null;
    }, COMPLETE_DELAY_MS);
  }, []);

  const start = useCallback(() => {
    if (pendingRef.current) return;

    if (completeTimerRef.current !== null) window.clearTimeout(completeTimerRef.current);
    completeTimerRef.current = null;
    pendingRef.current = true;
    setProgress(12);

    trickleTimerRef.current = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.max((92 - current) * 0.14, 1), 92));
    }, 180);

    // Do not leave a persistent bar behind if a navigation is interrupted or
    // rejected before the route can render.
    failsafeTimerRef.current = window.setTimeout(finish, FAILSAFE_DELAY_MS);
  }, [finish]);

  const currentUrl = `${pathname}${searchParams.size > 0 ? `?${searchParams.toString()}` : ""}`;

  useEffect(() => {
    if (urlRef.current !== null && urlRef.current !== currentUrl) {
      finish();
    }

    urlRef.current = currentUrl;
  }, [currentUrl, finish]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);

      if (
        destination.origin !== current.origin ||
        `${destination.pathname}${destination.search}` === `${current.pathname}${current.search}`
      ) {
        return;
      }

      start();
    };

    window.addEventListener(NAVIGATION_PROGRESS_START, start);
    window.addEventListener("popstate", start);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener(NAVIGATION_PROGRESS_START, start);
      window.removeEventListener("popstate", start);
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, [clearTimers, start]);

  if (progress === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1" aria-live="polite">
      <div
        className="h-full origin-left bg-primary shadow-[0_0_10px_var(--primary)] transition-transform duration-150 ease-out"
        role="progressbar"
        aria-label="Loading page"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
