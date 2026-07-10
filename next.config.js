/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.qwenlm.ai' },
      { protocol: 'https', hostname: '**' }
    ]
  },
  eslint: { ignoreDuringBuilds: true }
};

module.exports = nextConfig;