/**
 * character_icon.tsx contains a glob import that only works in Parcel.
 * vite.config.ts replaces that Parcel glob import by loading this file instead.
 * This file contains a glob import that only works in Vite.
 */

// Return a map of the form { "Icon_<id>": <url> }.
const images = Object.fromEntries(
  Object.entries(
    // `import.meta.glob` is a Vite-specific feature.
    // @ts-expect-error TODO: Can use "vite/client" types after removing conflicting definition in `assets/globals.d.ts`
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
