import vue from "@vitejs/plugin-vue";
import { codeInspectorPlugin } from "code-inspector-plugin";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import UnoCSS from "unocss/vite";
import vueSetupExtend from "unplugin-vue-setup-extend-plus/vite";
import { defineConfig, loadEnv, type PluginOption, type ProxyOptions } from "vite";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from "vite-plugin-html";
import { VitePWA } from "vite-plugin-pwa";
import NextDevTools from "vite-plugin-vue-devtools";
export default defineConfig(({ mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const title = env.VITE_GLOB_APP_TITLE?.replace(/\\n/g, "\n");
  const proxyEntries: [string, string][] = JSON.parse(env.VITE_PROXY || "[]");
  const proxy: Record<string, ProxyOptions> = Object.fromEntries(
    proxyEntries.map(([prefix, target]) => [
      prefix,
      {
        target,
        changeOrigin: true,
        ws: true,
        rewrite: (path: string) => path.replace(new RegExp(`^${prefix}`), ""),
        ...(target.startsWith("https://") ? { secure: false } : {})
      }
    ])
  );
  const compression = (env.VITE_BUILD_COMPRESS || "none").split(",");
  const deleteOriginFile = env.VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE === "true";

  return {
    base: env.VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src")
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/var";`
        }
      }
    },
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_PORT),
      open: env.VITE_OPEN === "true",
      cors: true,
      proxy
    },
    plugins: [
      vue(),
      env.VITE_DEVTOOLS === "true" && NextDevTools({ launchEditor: "code" }),
      vueSetupExtend({}),
      compression.includes("gzip") && viteCompression({ ext: ".gz", algorithm: "gzip", deleteOriginFile }),
      compression.includes("brotli") && viteCompression({ ext: ".br", algorithm: "brotliCompress", deleteOriginFile }),
      createHtmlPlugin({ minify: true, inject: { data: { title } } }),
      UnoCSS(),
      env.VITE_PWA === "true" &&
        VitePWA({
          registerType: "autoUpdate",
          manifest: {
            name: title,
            short_name: title,
            theme_color: "#ffffff",
            icons: [
              { src: "/logo.png", sizes: "192x192", type: "image/png" },
              { src: "/logo.png", sizes: "512x512", type: "image/png" },
              { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
            ]
          }
        }),
      env.VITE_REPORT === "true" &&
        (visualizer({ filename: "stats.html", gzipSize: true, brotliSize: true }) as PluginOption),
      env.VITE_CODEINSPECTOR === "true" && codeInspectorPlugin({ bundler: "vite" })
    ],
    build: {
      outDir: "dist",
      minify: "esbuild",
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
        }
      }
    }
  };
});
