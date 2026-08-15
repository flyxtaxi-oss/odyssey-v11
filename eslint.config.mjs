import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Worktree git interne d'outil (branche séparée) — ne pas linter.
    ".kilo/**",
  ]),
  {
    rules: {
      // An `_`-prefixed name is the conventional way to say "this binding is
      // required by a signature or destructuring shape but deliberately
      // unused". Without these patterns the convention is silently ignored, so
      // the only way to quiet the warning is to delete the parameter — which
      // breaks positional signatures and loses the documentation value of the
      // name. Real unused values still warn.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
