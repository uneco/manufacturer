/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: {url: '/', static: true},
    src: {url: '/dist'},
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    [
      '@snowpack/plugin-typescript',
      {
        tsc: './tools/tsc',
        args: '--build tsconfig.json',
      }
    ],
  ],
  alias: {
    "@app": "./src/app",
    "@pages": "./src/views/pages",
    "@partials": "./src/views/partials",
    "@components": "./src/views/components",
    "@initializers": "./src/config/initializers",
    "@assets": "./src/assets",
    "@styles": "./src/styles",
  },
  routes: [
    {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
