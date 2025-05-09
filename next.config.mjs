/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['tailwindcss'],
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
