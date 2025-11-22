import type { NextConfig } from "next";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../..", ".env") });

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
    },
};

export default nextConfig;
