export function selectedScript(): string {
  let params = new URLSearchParams(window.location.search);
  if (params.has("script")) {
    return params.get("script");
  }
  return "19";
}
