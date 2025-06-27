/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@test-pod/ui', '@test-pod/auth-shared', '@test-pod/database'],
}

export default nextConfig
