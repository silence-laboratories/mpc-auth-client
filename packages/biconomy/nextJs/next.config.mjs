<<<<<<< HEAD
// next.config.mjs
import dotenv from 'dotenv';
dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_KEY: process.env.API_KEY,
  },
=======
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
>>>>>>> origin/staging
};

export default nextConfig;
