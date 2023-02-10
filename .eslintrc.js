module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: ["standard-with-typescript", "prettier"],
  overrides: [
    {
      files: ["**/*.spec.ts"],
      rules: {
        "@typescript-eslint/consistent-type-assertions": "off",
        "@typescript-eslint/no-floating-promises": "off",
      },
    },
  ],
  plugins: ["prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json"],
  },
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/consistent-type-assertions": "off",
    camelcase: "off",
  },
};
