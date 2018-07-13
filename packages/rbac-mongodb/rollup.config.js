export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    name: 'rbac-mongodb'
  },
  external: [
    '@brainstaff/rbac',
    'mongoose'
  ]
};
