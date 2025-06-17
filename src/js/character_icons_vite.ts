// Return a map of the form { "Icon_<id>": <url> }.
const images = Object.fromEntries(
  Object.entries(
    // `import.meta.glob` is a Vite-specific feature.
    import.meta.glob("../../assets/icons/*.webp", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  )
    .map(([path, module]) => {
      const iconName = path.match(/(Icon_.*)\.webp$/);
      if (!iconName || !iconName[1]) {
        return null;
      }
      return [iconName[1], module];
    })
    .filter((entry) => entry !== null),
);
export default images;
