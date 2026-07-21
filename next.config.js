/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/zhihuisuke/openmaic/:path*',
        destination: 'https://openmaic-zhihuisuke.vercel.app/api/:path*',
      },
    ]
  },
}
module.exports = nextConfig
