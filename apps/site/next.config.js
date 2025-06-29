/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@test-pod/ui', '@test-pod/database'],
  images: {
    domains: ['images.unsplash.com', 'fastly.picsum.photos'],
  },
}

export default nextConfig
