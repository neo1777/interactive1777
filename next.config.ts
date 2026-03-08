import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",           // static HTML export for GitHub Pages
  basePath: "/interactive1777", // must match the GitHub repo name
  trailingSlash: true,        // required for static hosting (index.html per route)
  images: {
    unoptimized: true,        // next/image optimisation requires a server; disable for static export
  },
};

export default nextConfig;
