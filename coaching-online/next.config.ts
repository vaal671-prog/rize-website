import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Lets the dev server be opened from a phone on the same Wi-Fi (Next.js
  // otherwise blocks cross-origin requests to dev assets/HMR, so the page
  // loads but never becomes interactive). Add more IPs here if yours changes.
  allowedDevOrigins: ["172.20.198.250"],
};

export default nextConfig;
