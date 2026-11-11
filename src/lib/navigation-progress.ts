const NAVIGATION_PROGRESS_START = "smartiqliving:navigation-progress-start";

/** Starts the dashboard's global navigation indicator before imperative routing. */
export function startNavigationProgress() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NAVIGATION_PROGRESS_START));
}

export { NAVIGATION_PROGRESS_START };
