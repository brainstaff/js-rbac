export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'rbac-http',
    globals: {
      'axios': 'axios'
    }
  },
  external: [
    'axios'
  ]
};
