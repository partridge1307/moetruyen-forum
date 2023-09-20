/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.moetruyen.net'],
  },
  experimental: {
    optimizePackageImports: [
      '@aws-sdk/client-s3',
      'react-image-crop',
      'react-textarea-autosize',
      'unique-names-generator',
      'yjs',
    ],
  },
};

module.exports = nextConfig;
