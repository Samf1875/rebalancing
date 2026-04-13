const BANNER_KEY = 'rebalancing.banner.dismissed';
const WALKTHROUGH_KEY = 'rebalancing.walkthrough.completed';
/** After first visit, user sees the assortment workspace directly instead of the task list. */
const LIST_INTRO_KEY = 'rebalancing.listIntro.completed';

export function isBannerDismissed(): boolean {
  try {
    return localStorage.getItem(BANNER_KEY) === '1';
  } catch {
    return false;
  }
}

export function setBannerDismissed(): void {
  try {
    localStorage.setItem(BANNER_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** Clears persisted dismiss so the introduction banner can be shown again. */
export function clearBannerDismissed(): void {
  try {
    localStorage.removeItem(BANNER_KEY);
  } catch {
    /* ignore */
  }
}

export function isWalkthroughCompleted(): boolean {
  try {
    return localStorage.getItem(WALKTHROUGH_KEY) === '1';
  } catch {
    return false;
  }
}

export function setWalkthroughCompleted(): void {
  try {
    localStorage.setItem(WALKTHROUGH_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function isRebalancingListIntroCompleted(): boolean {
  try {
    return localStorage.getItem(LIST_INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

export function markRebalancingListIntroCompleted(): void {
  try {
    localStorage.setItem(LIST_INTRO_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** Clears persisted list intro so the task list shows again (e.g. QA / local testing). */
export function clearRebalancingListIntroCompleted(): void {
  try {
    localStorage.removeItem(LIST_INTRO_KEY);
  } catch {
    /* ignore */
  }
}
