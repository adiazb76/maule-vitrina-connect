import { supabase } from "@/integrations/supabase/client";

export type Category = { id: string; name: string; slug: string; sort_order: number };
export type Comuna = { id: string; name: string; slug: string; region: string };

export type Entrepreneur = {
  id: string;
  user_id: string | null;
  slug: string;
  business_name: string;
  owner_name: string;
  category_id: string | null;
  comuna_id: string | null;
  short_description: string;
  about: string | null;
  value_prop: string | null;
  photo_url: string | null;
  logo_url: string | null;
  tags: string[];
  phone: string | null;
  whatsapp: string | null;
  whatsapp_message: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  collaboration_seeking: string | null;
  collaboration_offering: string | null;
  status: "pendiente" | "aprobado" | "rechazado";
  featured: boolean;
  views: number;
  contacts: number;
  created_at: string;
  categories?: { name: string; slug: string } | null;
  comunas?: { name: string; slug: string } | null;
};

export type Product = {
  id: string;
  entrepreneur_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  info: string | null;
  sort_order: number;
};

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  starts_at: string;
  location: string | null;
  organizer: string | null;
  registration_url: string | null;
};

export type RadioItem = {
  id: string;
  title: string;
  kind: string;
  description: string | null;
  image_url: string | null;
  media_url: string | null;
  published_at: string;
};

const CARD_SELECT =
  "*, categories:category_id(name,slug), comunas:comuna_id(name,slug)";

export type DirectoryFilters = {
  search?: string;
  categorySlug?: string;
  comunaSlug?: string;
  sort?: "recientes" | "visitados" | "destacados" | "alfabetico";
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,sort_order")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchComunas(): Promise<Comuna[]> {
  const { data, error } = await supabase
    .from("comunas")
    .select("id,name,slug,region")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Comuna[];
}

export async function fetchEntrepreneurs(
  filters: DirectoryFilters = {},
  limit = 60,
): Promise<Entrepreneur[]> {
  let query = supabase
    .from("entrepreneurs")
    .select(CARD_SELECT)
    .eq("status", "aprobado")
    .limit(limit);

  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim().replace(/[%,]/g, "")}%`;
    query = query.or(
      `business_name.ilike.${term},owner_name.ilike.${term},short_description.ilike.${term},about.ilike.${term},value_prop.ilike.${term}`,
    );
  }

  switch (filters.sort) {
    case "visitados":
      query = query.order("views", { ascending: false });
      break;
    case "alfabetico":
      query = query.order("business_name");
      break;
    case "destacados":
      query = query.order("featured", { ascending: false }).order("views", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  let rows = (data ?? []) as unknown as Entrepreneur[];

  if (filters.categorySlug) rows = rows.filter((r) => r.categories?.slug === filters.categorySlug);
  if (filters.comunaSlug) rows = rows.filter((r) => r.comunas?.slug === filters.comunaSlug);
  return rows;
}

export async function fetchFeatured(limit = 6): Promise<Entrepreneur[]> {
  const { data, error } = await supabase
    .from("entrepreneurs")
    .select(CARD_SELECT)
    .eq("status", "aprobado")
    .order("featured", { ascending: false })
    .order("views", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Entrepreneur[];
}

export async function fetchProducts(entrepreneurId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("entrepreneur_id", entrepreneurId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("published", true)
    .order("starts_at");
  if (error) throw error;
  return (data ?? []) as EventItem[];
}

export async function fetchRadioItems(): Promise<RadioItem[]> {
  const { data, error } = await supabase
    .from("radio_items")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RadioItem[];
}

export async function fetchWeeklyFeature() {
  const { data, error } = await supabase
    .from("weekly_features")
    .select(`id, week_start, story, media_url, entrepreneurs:entrepreneur_id(${CARD_SELECT})`)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as {
    id: string;
    week_start: string;
    story: string | null;
    media_url: string | null;
    entrepreneurs: Entrepreneur | null;
  } | null;
}

export function logInteraction(entrepreneurId: string, kind: string) {
  void supabase.rpc("log_interaction", {
    _entrepreneur_id: entrepreneurId,
    _kind: kind,
  });
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hola, vi tu emprendimiento en La Vitrina y me gustaría conocer más sobre tus productos/servicios.";

export function whatsappLink(e: Pick<Entrepreneur, "whatsapp" | "whatsapp_message">) {
  if (!e.whatsapp) return null;
  const number = e.whatsapp.replace(/[^0-9]/g, "");
  const text = encodeURIComponent(e.whatsapp_message?.trim() || DEFAULT_WHATSAPP_MESSAGE);
  return `https://wa.me/${number}?text=${text}`;
}

export function instagramLink(handle: string | null) {
  if (!handle) return null;
  if (handle.startsWith("http")) return handle;
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export function websiteLink(url: string | null) {
  if (!url) return null;
  return url.startsWith("http") ? url : `https://${url}`;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
