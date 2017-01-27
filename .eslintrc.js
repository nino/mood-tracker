module.exports = {
  "parser": "babel-eslint",
  "extends": "airbnb",
  "installedESLint": true,
  "plugins": [
    "babel",
    "react",
    "jsx-a11y",
    "import",
    "flowtype"
  ],
  "rules": {
    "babel/flow-object-type": 1,
    "react/sort-comp": "off",
    "react/jsx-filename-extension": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {"devDependencies": ["**/*.test.js", "**/*.spec.js"]}
    ],
    "import/no-named-as-default": "off",
    "max-len": "off"
  },
};
