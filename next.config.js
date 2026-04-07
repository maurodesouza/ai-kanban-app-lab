/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['clsx', 'tailwind-merge']
  },
  images: {
    domains: []
  }
}

module.exports = nextConfig
