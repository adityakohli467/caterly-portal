/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  output: 'standalone',
  // Optimize for faster builds and prevent serialization issues
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
  },
  // Enable prefetching for faster navigation
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    domains: [
      'localhost',
      'via.placeholder.com',
      'caterly-uploads-unique-id.s3.ap-southeast-2.amazonaws.com',
      'n8sefsa42s.ap-southeast-2.awsapprunner.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'n8sefsa42s.ap-southeast-2.awsapprunner.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.ap-southeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'caterly-uploads-unique-id.s3.ap-southeast-2.amazonaws.com',
      },
    ],
  },
  // Webpack configuration to help with serialization
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent serialization issues on server
      config.optimization = {
        ...config.optimization,
        minimize: false, // Disable minification on server to help debug
      }
    }
    return config
  },
}

module.exports = nextConfig


