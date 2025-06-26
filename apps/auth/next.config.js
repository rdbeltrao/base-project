/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@test-pod/ui'],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
