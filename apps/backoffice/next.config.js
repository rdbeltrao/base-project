/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@test-pod/ui', '@test-pod/auth-shared'],
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
