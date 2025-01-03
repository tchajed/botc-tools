import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import posthtml from "posthtml";
import type {
  AliasOptions,
  IndexHtmlTransformHook,
  IndexHtmlTransformResult,
} from "vite";
import { defineConfig } from "vite";

const alias: AliasOptions = [
  // `.parcelrc` uses the `parcel-resolver-ts-base-url` plugin so imports can be relative to `./src/js` instead of the current file.
  // The equivalent in Vite is to declare an alias for every file and directory in `./src/js`.
  ...fs.readdirSync("./src/js").map((filename) => {
    const name = filename.replace(/\.(j|t)sx?$/, "");
    return {
      find: name,
      replacement: path.resolve(__dirname, "src", "js", name),
    };
  }),
  {
    // Parcel imports our character icons using a Parcel-specific glob syntax.
    // Redirect to character_icons_vite.ts, where we'll use a Vite-specific glob syntax instead.
    find: /^.*\/assets\/icons\/\*\.webp$/,
    replacement: path.resolve(__dirname, "src", "js", "character_icons_vite"),
  },
];

// We run PostHTML on our `index.html` and `script.html` files to process an `<include>` tag.
function postHtmlPlugin() {
  return {
    name: "posthtml-transform",
    async transformIndexHtml(html: string): Promise<IndexHtmlTransformResult> {
      const postHtmlResult = await posthtml()
        .use(require("posthtml-include")())
        .process(html);
      return postHtmlResult.html;
    },
  };
}

export default defineConfig({
  assetsInclude: ["icons/touch-icon.png"],
  build: {
    emptyOutDir: true,
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src", "index.html"),
        script: path.resolve(__dirname, "src", "script.html"),
      },
    },
  },
  plugins: [
    react({
      babel: {
        babelrc: true,
      },
    }),
    postHtmlPlugin(),
  ],
  resolve: {
    alias,
  },
  root: "src",
});
