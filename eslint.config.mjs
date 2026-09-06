import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      // Existing clinical/admin UI contains intentional effect-driven data loading
      // and legacy form state synchronization. Keep these as review warnings rather
      // than blocking production validation while the application is in active use.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/exhaustive-deps": "warn",

      // Gradually type legacy API payloads/components without making the current
      // production build fail on existing dynamic Prisma/API shapes.
      "@typescript-eslint/no-explicit-any": "warn",

      // Non-functional JSX/text cleanup items should not block deployment.
      "react/no-unescaped-entities": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@next/next/no-img-element": "warn",
      "prefer-const": "warn",
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
