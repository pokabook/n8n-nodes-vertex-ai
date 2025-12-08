const { src, dest } = require('gulp');

function buildIcons() {
  return src('src/**/*.{svg,png}').pipe(dest('dist'));
}

exports['build:icons'] = buildIcons;

