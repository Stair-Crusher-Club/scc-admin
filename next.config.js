/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "scc-accessibility-images.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-prod-accessibility-images.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-dev-accessibility-images.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-dev-home-banners.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-prod-home-banners.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-dev-crusher-labels.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-prod-crusher-labels.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com"},
      { protocol: "https", hostname: "scc-dev-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com"},
      // CDN
      { protocol: "https", hostname: "d1whorck6z6h62.cloudfront.net" },
      { protocol: "https", hostname: "d3vmj65l82owxs.cloudfront.net" },
    ],
  },
}

module.exports = nextConfig
