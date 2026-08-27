import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
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
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
  define: forcedDefine,
});
