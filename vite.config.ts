// @lovable.dev/vite-tanstack-config already includes the core TanStack/Vite plugins.
// Force Cloudflare build-time VITE_SUPABASE_* variables when present so production
// cannot fall back to another Lovable/Supabase project.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

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
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    define: forcedDefine,
  },
});
