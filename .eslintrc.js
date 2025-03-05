module.exports = {
    root: true,
    env: {
        node: true,
        jest: true
    },
    parser: "@typescript-eslint/parser",
    parserOptions: { project: ["./tsconfig.json"], tsconfigRootDir: __dirname, sourceType: "module" },
    plugins: ["@typescript-eslint/eslint-plugin", "unused-imports"],
    extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
    ignorePatterns: ["dist", ".eslintrc.js"],
    rules: {
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "unused-imports/no-unused-imports": "error",
        "prettier/prettier": [
            "warn",
            {
                arrowParens: "always",
                semi: false,
                trailingComma: "none",
                tabWidth: 4,
                endOfLine: "auto",
                useTabs: false,
                singleQuote: false,
                printWidth: 180,
                jsxSingleQuote: true,
                plugins: ["prettier-plugin-organize-imports"]
            }
        ]
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


