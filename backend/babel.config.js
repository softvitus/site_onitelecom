export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '20',
        },
        modules: 'commonjs',
      },
    ],
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
            modules: 'commonjs',
          },
        ],
      ],
    },
  },
};
