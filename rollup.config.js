import babel from '@rollup/plugin-babel';

const config = {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [babel({ babelHelpers: 'bundled' })],
};

export default config;
