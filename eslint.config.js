import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ignores: ["node_modules", ".next", "dist"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        // Add any other global variables here specific to your project
      },
    },
    rules: {
      // General ESLint rules
      "no-unused-vars": "warn",
      // React specific rules
      "react/react-in-jsx-scope": "off", // Not needed for Next.js with React 17+
      "react/prop-types": "off",
      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // TypeScript specific rules handled by tseslint.configs.recommended
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // You can add more specific configurations here, for example for Next.js
  // if you have a separate plugin for Next.js
];