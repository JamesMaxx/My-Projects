/**
 * Next.js config
 * Disable ESLint during build to avoid incompatible CLI option errors in certain environments.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during production builds. We still run lint locally with `npm run lint`.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
