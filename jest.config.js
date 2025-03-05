const esModules = ["@nestjs/microservices"].join("|")
module.exports = {
    moduleFileExtensions: ["js", "json", "ts"],
    moduleNameMapper: {
        "^src/(.*)$": "<rootDir>/$1",
        "^@utils$": "<rootDir>/src/utils"
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
    transform: {
        "\\.ts$": "ts-jest"
    },
    rootDir: "src",
    testRegex: ".*\\.spec\\.ts$",
    collectCoverageFrom: ["**/*.(t|j)s"],
    coverageDirectory: "../coverage",
    testEnvironment: "node"
}
