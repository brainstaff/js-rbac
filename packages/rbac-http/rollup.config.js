export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'rbac-http',
    globals: {
      '@brainstaff/rbac': 'rbac',
      'axios': 'axios'
    }
  },
  external: [
    '@brainstaff/rbac',
    'axios'
  ]
};
