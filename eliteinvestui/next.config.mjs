/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
       destination:
          "https://eliteinvest-api.azurewebsites.net/:path*",
      },
    ];
  },
};

export default nextConfig;
