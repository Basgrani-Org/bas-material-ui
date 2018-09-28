const settings = {
  env: {
    browser: true,
    jquery: true,
  },
  parser: 'babel-eslint',
  extends: 'standard',
  plugins: ['import'],
  settings: {
    'import/parser': 'babel-eslint',
  },
  globals: {
    NODE_ENV: true,
    BasUI: true,
    BasUIDocs: true,
    Parsley: true,
    autosize: true,
    Dropzone: true,
    toastr: true,
    Waves: true,
  },
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      },
    ],
    'camelcase': 0,
    'no-useless-escape': 0,
    'no-fallthrough': ['error', { commentPattern: 'break[\\s\\w]*omitted' }],
    'standard/computed-property-even-spacing': 0,
  },
}

module.exports = settings
