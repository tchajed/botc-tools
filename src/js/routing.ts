export type Page = "roles" | "nightsheet" | "randomize";

export function pageUrl(page: Page, id: string): string {
  // GitHub pages will serve /page.html for /page
  return `./${page}?id=${id}`;
}
