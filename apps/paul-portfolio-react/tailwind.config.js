const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const rootConfig = require('../../tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...rootConfig,
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};
