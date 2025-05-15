module.exports = {
    root: true,
    env: {
        node: true,
        jest: true
    },
    parser: "@typescript-eslint/parser",
    parserOptions: { project: "tsconfig.json", sourceType: "module" },
    plugins: ["@typescript-eslint/eslint-plugin"],
    extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
    ignorePatterns: [".eslintrc.js"],
    rules: {
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-explicit-any": "error"
    }
}

// {
//     "parser": "@typescript-eslint/parser",
//     "parserOptions": { "project": ["./tsconfig.json"] },
//     "plugins": ["@typescript-eslint", "unused-imports"],
//     "rules": {
//         "unused-imports/no-unused-imports": "error"
//     }
// }


