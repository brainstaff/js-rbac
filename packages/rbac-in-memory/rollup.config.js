export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'rbac-in-memory',
    globals: {
      '@brainstaff/rbac': 'rbac'
    }
  },
  external: [
    '@brainstaff/rbac'
  ]
};
