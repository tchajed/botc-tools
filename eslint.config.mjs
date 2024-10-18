import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import tsParser from "@typescript-eslint/parser";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "unused-imports": unusedImports,
    },

    languageOptions: {
      parser: tsParser,
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],

    rules: {
      "no-unused-vars": "off",

      //   allow unused vars that start with _
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];
