import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';

const config = {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [babel({ babelHelpers: 'bundled' }), json()],
};

export default config;
