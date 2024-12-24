module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**', // Allow any domain
      },
      {
        protocol: 'https',
        hostname: '**', // Allow any domain
      },
    ],
  },
}
