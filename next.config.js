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
  // Exclude supabase functions from Next.js type checking
  typescript: {
    ignoreBuildErrors: false,
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Don't include supabase functions in the build
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./supabase/functions/**/*'],
    },
  },
};

module.exports = nextConfig;
