/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  experimental: { serverComponentsExternalPackages: ['mongoose'] },
};
