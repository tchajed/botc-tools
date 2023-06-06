export type Page = "roles" | "nightsheet" | "randomize";

export function pageUrl(page: Page, id: string): string {
  return `./${page}.html?id=${id}`;
}
