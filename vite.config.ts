import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const forcedDefine: Record<string, string> = {};

if (process.env.VITE_SUPABASE_URL) {
  forcedDefine["import.meta.env.VITE_SUPABASE_URL"] =
    JSON.stringify(process.env.VITE_SUPABASE_URL);
}

if (process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  forcedDefine["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] =
    JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
}

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    react(),
  ],
  define: forcedDefine,
});
