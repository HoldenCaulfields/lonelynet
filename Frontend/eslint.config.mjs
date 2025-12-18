import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Load Next.js + TypeScript configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 🧩 Add your custom rules in a separate config block
  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],

    rules: {
      // 🟢 Allow `any`
      "@typescript-eslint/no-explicit-any": "off",

      // 🟡 Only warn for unused vars
      "@typescript-eslint/no-unused-vars": "warn",

      // 🟢 Allow <img>
      "@next/next/no-img-element": "off",

      // 🟡 Warn about missing deps in useEffect
      "react-hooks/exhaustive-deps": "warn",

      // 🟢 Allow console logs
      "no-console": "off",
    },
  },
];

export default eslintConfig;
