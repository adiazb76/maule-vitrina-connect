import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const slugInput = z.object({ slug: z.string().min(1).max(120) });

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getEntrepreneurBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => slugInput.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("entrepreneurs")
      .select("*, categories:category_id(name,slug), comunas:comuna_id(name,slug)")
      .eq("slug", data.slug)
      .eq("status", "aprobado")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("entrepreneur_id", row.id)
      .order("sort_order");

    return { entrepreneur: row, products: products ?? [] };
  });
