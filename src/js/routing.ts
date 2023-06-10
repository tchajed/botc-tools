export type Page = "roles" | "nightsheet" | "randomize";

export function pageUrl(page: Page, id: string | number): string {
  // GitHub pages will serve /page.html for /page
  return `./script.html?page=${page}&id=${id}`;
}
