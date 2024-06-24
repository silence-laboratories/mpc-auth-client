// next.config.mjs
import dotenv from 'dotenv';
dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_KEY: process.env.API_KEY,
  },
};

export default nextConfig;
