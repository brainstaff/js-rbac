export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    name: 'rbac-postgres'
  },
  external: [
    '@brainstaff/rbac',
    'objection'
  ]
};
