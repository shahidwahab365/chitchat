import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true, 
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "", 
        pathname: "/**", 
      },
      {
        protocol: "https",
        hostname: "athkawcmaitlhfgrgpfy.storage.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "athkawcmaitlhfgrgpfy.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
