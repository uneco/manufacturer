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
    "@config": "./src/config",
    "@models": "./src/models",
    "@pages": "./src/views/pages",
    "@partials": "./src/views/partials",
    "@components": "./src/views/components",
    "@hooks": "./src/views/hooks",
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
    "source": "remote",
    "types": true
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
