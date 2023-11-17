/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.moetruyen.net',
        port: '',
        pathname: '/*/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@aws-sdk',
      'react-image-crop',
      'react-textarea-autosize',
      'unique-names-generator',
      'yjs',
    ],
  },
};

module.exports = nextConfig;
