import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["lucide-react"],
  serverExternalPackages: ["@prisma/client", "bcryptjs", "jsonwebtoken"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
