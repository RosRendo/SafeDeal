import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      // Category Shorthands & Category URLs -> Canonical /browse with ?cat= parameter
      { source: "/category", destination: "/browse", permanent: true },
      { source: "/category/:slug", destination: "/browse?cat=:slug", permanent: true },
      { source: "/categories", destination: "/browse", permanent: true },
      { source: "/accounts", destination: "/browse?cat=accounts", permanent: true },
      { source: "/keys", destination: "/browse?cat=keys", permanent: true },
      { source: "/currency", destination: "/browse?cat=currency", permanent: true },
      { source: "/gift-cards", destination: "/browse?cat=gift-cards", permanent: true },
      { source: "/software", destination: "/browse?cat=software", permanent: true },
      { source: "/social", destination: "/browse?cat=social", permanent: true },

      // Legacy Seller Routes -> Canonical /seller
      { source: "/sell", destination: "/seller", permanent: true },
      { source: "/sell/new", destination: "/seller/listings/new", permanent: true },
      { source: "/sell/earnings", destination: "/seller/earnings", permanent: true },

      // Inbox Alias -> Canonical /messages
      { source: "/inbox", destination: "/messages", permanent: true },

      // Ops Back Office -> Canonical /admin
      { source: "/ops", destination: "/admin", permanent: true },
      { source: "/ops/:path*", destination: "/admin/:path*", permanent: true },

      // Buyer Protection -> Canonical /protection
      { source: "/buyer-protection", destination: "/protection", permanent: true },

      // Bare /listing -> Catalog Browse
      { source: "/listing", destination: "/browse", permanent: true },

      // Order Lifecycle Aliases -> Canonical /orders
      { source: "/dispute", destination: "/orders", permanent: true },
      { source: "/release", destination: "/orders", permanent: true },
      { source: "/vault", destination: "/orders", permanent: true },

      // Admin Action Shortcuts -> Canonical /admin/...
      { source: "/force-settle", destination: "/admin/disputes/force-settle", permanent: true },
      { source: "/sanctions", destination: "/admin/users/sanctions", permanent: true },
    ];
  },
};

export default nextConfig;
