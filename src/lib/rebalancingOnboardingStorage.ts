const BANNER_KEY = 'rebalancing.banner.dismissed';
const WALKTHROUGH_KEY = 'rebalancing.walkthrough.completed';

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
