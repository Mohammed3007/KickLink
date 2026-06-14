import { fileURLToPath } from 'node:url';

const monorepoRoot = fileURLToPath(new URL('../..', import.meta.url));

const nextConfig = {
  transpilePackages: ['@kicklink/shared'],
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
