export function selectedScript(): string {
  let params = new URLSearchParams(window.location.search);
  if (params.has("id")) {
    return params.get("id");
  }
  return "19";
}
