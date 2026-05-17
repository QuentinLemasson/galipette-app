import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import importX from "eslint-plugin-import-x";
import globals from "globals";
import prettier from "eslint-config-prettier";

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/node_modules/**",
      "**/coverage/**",
      "pnpm-lock.yaml",
    ],
  },

  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
      },
    },
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
      "import-x": importX,
    },

    rules: {
      "react/react-in-jsx-scope": "off",

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "import-x/order": [
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
);
