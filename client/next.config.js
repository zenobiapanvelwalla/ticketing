module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 300; //ms
    return config;
  },
};