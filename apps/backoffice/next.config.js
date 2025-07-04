/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@test-pod/ui', '@test-pod/auth-shared'],
  experimental: {
    ssr: false,
  },
}

export default nextConfig
