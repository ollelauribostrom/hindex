module.exports = {
  "extends": "airbnb",
  "plugins": [
      "react",
      "jsx-a11y",
      "import"
  ],
  "env": {
    "node": true,
  },
  "rules": {
    "no-console": 0,
    "no-unused-vars": ["error", {
      "varsIgnorePattern": "chai|should",
      "ignoreRestSiblings": true,
    }],
    "no-restricted-syntax": 0,
    "guard-for-in": 0,
    "import/prefer-default-export": 0,
    "global-require": 0
  },
  "globals": {
    "describe": true,
    "before": true,
    "it": true,
    "expect": true,
    "jest": true
  },
  "parser": "babel-eslint",
};

