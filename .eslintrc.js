module.exports = {
  "extends": "airbnb",
  "installedESLint": true,
  "plugins": [
    "react",
    "jsx-a11y",
    "import"
  ],
  "rules": {
    "react/jsx-filename-extension": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {"devDependencies": ["**/*.test.js", "**/*.spec.js"]}
    ]
  },
};
