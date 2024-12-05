import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "with-single-extends",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off", // TODO: Get rid of any and activate the rule
      "@typescript-eslint/no-unsafe-declaration-merging": "off", // TODO: Fix Get rid of objection and activate the rule
      "@typescript-eslint/no-unused-expressions": "off", // TODO: Get rid of chai and activate the rule
    },
  },
];
