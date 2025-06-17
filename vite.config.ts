import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import posthtml from "posthtml";
import type { AliasOptions, IndexHtmlTransformResult } from "vite";
import { defineConfig } from "vite";

const alias: AliasOptions = [
  // Set up aliases so imports can be relative to `./src/js` instead of the current file.
  // This declares an alias for every file and directory in `./src/js`.
  ...fs.readdirSync("./src/js").map((filename) => {
    const name = filename.replace(/\.(j|t)sx?$/, "");
    return {
      find: name,
      replacement: path.resolve(__dirname, "src", "js", name),
    };
  }),
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
