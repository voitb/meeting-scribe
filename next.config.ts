/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
