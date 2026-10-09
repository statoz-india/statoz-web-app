import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Image paths must come from src/utils/imageConstant.ts.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/utils/imageConstant.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\/assets\\/.*\\.(svg|png|jpe?g|webp|gif|avif|ico)$/i]",
          message: "Use IMAGES from @/utils/imageConstant instead of hardcoding image paths.",
        },
        {
          selector:
            "TemplateLiteral:has(TemplateElement[value.raw=/\\/assets\\//]):has(TemplateElement[value.raw=/\\.(svg|png|jpe?g|webp|gif|avif|ico)$/i])",
          message: "Use IMAGES from @/utils/imageConstant instead of hardcoding image paths.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
