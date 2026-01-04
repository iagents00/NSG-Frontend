import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  webpack: (config) => {
    config.output.devtoolModuleFilenameTemplate = 'nsg:///[resource-path]';
    return config;
  },

};

export default nextConfig;
