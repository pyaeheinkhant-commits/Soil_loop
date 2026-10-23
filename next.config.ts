import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.SOIL_LOOP_VERIFY === "1" ? ".next-verify" : ".next",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
