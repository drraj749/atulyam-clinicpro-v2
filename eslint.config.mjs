import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Existing application code uses effect-driven data loading and legacy
      // synchronization patterns. These are reviewed separately from the
      // production build/type-safety gate.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/exhaustive-deps": "off",

      // Legacy API/component payloads are being migrated incrementally.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@next/next/no-img-element": "warn",
      "prefer-const": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
  {
    files: ["scripts/**/*.cjs"],
    rules: {
      // The SQLite → PostgreSQL migration utility intentionally uses CommonJS
      // because it is a standalone Node.js script, not application code.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
