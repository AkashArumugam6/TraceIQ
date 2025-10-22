/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GRAPHQL_HTTP: process.env.NEXT_PUBLIC_GRAPHQL_HTTP || 'http://localhost:4000/graphql',
    NEXT_PUBLIC_GRAPHQL_WS: process.env.NEXT_PUBLIC_GRAPHQL_WS || 'ws://localhost:4000/graphql',
  },
  turbopack: {
    root: process.cwd()
  }
}

module.exports = nextConfig
