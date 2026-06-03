/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site — emits ./out for static hosting (Firebase Hosting).
  output: 'export',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
