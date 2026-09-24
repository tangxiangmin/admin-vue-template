module.exports = {
  "*.{js,jsx,ts,tsx,mjs,cjs,vue}": ["oxlint --fix --deny-warnings", "oxfmt --write"],
  "*.{json,jsonc,yaml,yml,scss,css,less,html,md}": ["oxfmt --write --no-error-on-unmatched-pattern"]
};
