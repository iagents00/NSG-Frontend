import type { NextConfig } from "next";

// Only use standalone output for Docker deployments (not Vercel)
const isDocker = process.env.DOCKER === 'true';

const nextConfig: NextConfig = {
  // ============================================
  // PRODUCTION OPTIMIZATION
  // ============================================

  // Output standalone build for Docker/containerization only
  // Vercel handles its own build output - standalone breaks API routes on Vercel
  ...(isDocker ? { output: 'standalone' as const } : {}),

  // Compress images automatically
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'youtu.be',
      },
    ],
  },

  // Enable compression
  compress: true,

  // Power-only during builds for static pages
  poweredByHeader: false,

  // Strict mode for better debugging
  reactStrictMode: true,

  // ============================================
  // EXPERIMENTAL FEATURES
  // ============================================
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // ============================================
  // WEBPACK CONFIGURATION
  // ============================================
  webpack: (config, { isServer }) => {
    // Custom module filename for better debugging
    config.output.devtoolModuleFilenameTemplate = 'nsg:///[resource-path]';
    
    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  // ============================================
  // TURBOPACK (for dev mode)
  // ============================================
  turbopack: {},

  // ============================================
  // HEADERS & CDN
  // ============================================
  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ============================================
  // REWRITES (API Proxy)
  // ============================================
  async rewrites() {
    const backendUrl = (process.env.API_URL || '').replace(/\/$/, '');
    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
