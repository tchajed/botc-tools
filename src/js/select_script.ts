export function selectedScript(): string {
  let params = new URLSearchParams(window.location.search);
  console.log(params);
  if (params.has("id")) {
    return params.get("id");
  }
  return "19";
}
