import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

type LikeSummaryProps = {
  contentType:
    | "entrepreneur"
    | "event"
    | "marketplace";

  contentId: string;

  compact?: boolean;
};

export function LikeSummary({
  contentType,
  contentId,
  compact = false,
}: LikeSummaryProps) {
  const likes = useQuery({
    queryKey: [
      "like-count",
      contentType,
      contentId,
    ],

    queryFn: async () => {
      const { data, error } =
        await (supabase as any)
          .from("like_counts")
          .select("likes")
          .eq(
            "content_type",
            contentType,
          )
          .eq(
            "content_id",
            contentId,
          )
          .maybeSingle();

      if (error) {
        throw error;
      }

      return Number(
        data?.likes ?? 0,
      );
    },

    staleTime: 0,

    refetchOnMount: "always",
  });

  const count =
    likes.data ?? 0;

  const hasLikes =
    count > 0;

  return (
    <span
      className={
        compact
          ? `inline-flex items-center gap-1 text-xs ${
              hasLikes
                ? "font-semibold text-red-500"
                : "text-muted-foreground"
            }`
          : `inline-flex items-center gap-1.5 text-sm ${
              hasLikes
                ? "font-semibold text-red-500"
                : "text-muted-foreground"
            }`
      }
    >
      <Heart
        className={
          compact
            ? `h-3.5 w-3.5 ${
                hasLikes
                  ? "fill-red-500 text-red-500"
                  : ""
              }`
            : `h-4 w-4 ${
                hasLikes
                  ? "fill-red-500 text-red-500"
                  : ""
              }`
        }
      />

      {count}
    </span>
  );
}