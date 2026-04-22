/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Existing Apps Script (.gs/.js) files are excluded via tsconfig; don't fail build on unrelated code.
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
