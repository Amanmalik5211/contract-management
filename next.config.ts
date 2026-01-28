import type { NextConfig } from "next";
import { copyFileSync, existsSync } from "fs";
import { join } from "path";

// Copy PDF.js worker to public directory
const pdfWorkerSrc = join(process.cwd(), "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const pdfWorkerDest = join(process.cwd(), "public", "pdf.worker.min.mjs");

if (existsSync(pdfWorkerSrc) && !existsSync(pdfWorkerDest)) {
  try {
    copyFileSync(pdfWorkerSrc, pdfWorkerDest);
    console.log("✓ Copied PDF.js worker to public directory");
  } catch (error) {
    console.warn("⚠ Could not copy PDF.js worker:", error);
  }
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
