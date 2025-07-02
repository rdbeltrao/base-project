/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@test-pod/ui',
    '@test-pod/auth-shared',
    '@test-pod/database',
    '@test-pod/feature-flags',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't include fs module in client-side bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

export default nextConfig
