/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  server: "./server.ts",
  serverBuildPath: "build/server/index.js",
  serverConditions: ["workerd", "worker", "browser"],
  serverDependenciesToBundle: "all",
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  
  // Cloudflare Pages specific configuration
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
  
  // Build optimization
  cacheDirectory: "./node_modules/.cache/remix",
  
  // Route configuration
  routes(defineRoutes) {
    return defineRoutes((route) => {
      // Define your custom routes here if needed
    });
  },
};