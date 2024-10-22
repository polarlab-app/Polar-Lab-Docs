export default async (phase, { defaultConfig }) => {
    const { default: connectToMongo } = await import('./lib/db.js');
    await connectToMongo(process.env.MONGO_URI, 'primary');

    const nextConfig = {
        reactStrictMode: false,
        poweredByHeader: false,
        experimental: {
            missingSuspenseWithCSRBailout: false,
            serverActions: {
                allowedOrigins: ['https://docs2.polarlab.app', 'docs2.polarlab.app', '172.99.0.7:3001'],
            },
        },
        images: {
            remotePatterns: [
                {
                    protocol: 'https',
                    hostname: 'cdn.polarlab.app',
                    port: '',
                    pathname: '/**',
                },
            ],
        },
        devIndicators: {
            autoPrerender: false,
        },
        onDemandEntries: {
            maxInactiveAge: 1000 * 60 * 60,
        },
        async headers() {
            return [
                {
                    source: '/(.*)',
                    headers: [
                        {
                            key: 'Content-Security-Policy',
                            value: `
                            default-src 'self';
                            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://us-assets.i.posthog.com;
                            style-src 'self' 'unsafe-inline';
                            img-src 'self' data: https://cdn.polarlab.app;
                            font-src 'self';
                            connect-src 'self' https://api.polarlab.app https://us.i.posthog.com;
                            frame-src 'self';
                            object-src 'none';
                            base-uri 'self';
                            form-action 'self';
                        `
                                .replace(/\s{2,}/g, ' ')
                                .trim(),
                        },
                        {
                            key: 'X-Frame-Options',
                            value: 'DENY',
                        },
                        {
                            key: 'Referrer-Policy',
                            value: 'no-referrer',
                        },
                        {
                            key: 'Permissions-Policy',
                            value: 'geolocation=(), microphone=(), camera=()',
                        },
                    ],
                },
            ];
        },
    };

    const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
        enabled: process.env.ANALYZE === 'true',
    });

    return withBundleAnalyzer(nextConfig);
};
