/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    
    // Exclude Supabase Edge Functions from webpack compilation
    config.module.rules.push({
      test: /supabase\/functions\/.*/,
      use: 'ignore-loader',
    });
    
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./supabase/functions/**/*'],
    },
  },
};

module.exports = nextConfig;
