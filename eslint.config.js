const globals = require("globals");
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = [
  // Global ignores
  {
    ignores: ["node_modules/", ".next/", "dist/"],
  },
  // Base config for JS/MJS/CJS files
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  // Config for TypeScript files
  ...tseslint.config(
    ...tseslint.configs.recommended,
    {
      files: ["**/*.{ts,tsx}"],
      plugins: {
        react,
        "react-hooks": reactHooks,
      },
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project: "./tsconfig.json",
          ecmaFeatures: {
            jsx: true,
          },
        },
        globals: {
          ...globals.browser,
        },
      },
      rules: {
        "no-unused-vars": "warn",
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
      settings: {
        react: {
          version: "detect",
        },
      },
    }
  ),
];