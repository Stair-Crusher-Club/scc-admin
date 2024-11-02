/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "scc-accessibility-images.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-prod-accessibility-images.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-dev-accessibility-images.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-dev-home-banners.s3.ap-northeast-2.amazonaws.com"},
      { protocol: "https", hostname: "scc-home-banners.s3.ap-northeast-2.amazonaws.com"},
    ],
  },
}

module.exports = nextConfig
