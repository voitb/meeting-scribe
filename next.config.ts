/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  
  serverExternalPackages: ["pdfkit"],
  images: {
    domains: ['i.ytimg.com'],
  },
};

export default nextConfig;
