import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["**/dist/**", "**/build/**", "**/.turbo/**", "**/node_modules/**"],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      import: importPlugin,
    },

    rules: {
      "react/react-in-jsx-scope": "off",

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "import/order": [
        "warn",
        {
          alphabetize: {
            order: "asc",
          },
          "newlines-between": "always",
        },
      ],
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },

  prettier,
];
