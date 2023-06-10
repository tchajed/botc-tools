export type Page = "roles" | "night" | "assign";

export function pageUrl(page: Page, id: string | number): string {
  // GitHub pages will serve /page.html for /page
  return `./script.html?page=${page}&id=${id}`;
}

/* Remember the original scroll position for each sub-page and restore it on tab
 * switch. */

export function saveScroll(page: Page) {
  window.sessionStorage.setItem(`scroll-${page}`, window.scrollY.toString());
}

export function restoreScroll(page: Page) {
  const y = window.sessionStorage.getItem(`scroll-${page}`);
  if (y) {
    window.scrollTo({
      top: parseInt(y),
    });
    window.sessionStorage.removeItem(`scroll-${page}`);
  }
}

export function clearSavedScroll() {
  for (const page of ["roles", "night", "assign"]) {
    window.sessionStorage.removeItem(`scroll-${page}`);
  }
}
