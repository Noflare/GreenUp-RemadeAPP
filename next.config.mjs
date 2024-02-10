/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://192.168.1.200/:path*', // replace with your API server URL
            },
        ];
    },
    reactStrictMode: true,
    swcMinify: true,
    images: {
        unoptimized: true
    }
};

export default nextConfig;
