import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

type LikeButtonProps = {
  contentType:
    | "entrepreneur"
    | "event"
    | "marketplace";

  contentId: string;

  compact?: boolean;
};

export function LikeButton({
  contentType,
  contentId,
  compact = false,
}: LikeButtonProps) {
  const queryClient =
    useQueryClient();

  const state = useQuery({
    queryKey: [
      "like-state",
      contentType,
      contentId,
    ],

    queryFn: async () => {
      const {
        data: authData,
      } =
        await supabase.auth.getUser();

      const user =
        authData.user;

      const {
        count,
        error: countError,
      } =
        await (supabase as any)
          .from("likes")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq(
            "content_type",
            contentType,
          )
          .eq(
            "content_id",
            contentId,
          );

      if (countError) {
        throw countError;
      }

      if (!user) {
        return {
          count:
            count ?? 0,

          liked:
            false,

          userId:
            null,
        };
      }

      const {
        data: ownLike,
        error: ownError,
      } =
        await (supabase as any)
          .from("likes")
          .select("id")
          .eq(
            "user_id",
            user.id,
          )
          .eq(
            "content_type",
            contentType,
          )
          .eq(
            "content_id",
            contentId,
          )
          .maybeSingle();

      if (ownError) {
        throw ownError;
      }

      return {
        count:
          count ?? 0,

        liked:
          Boolean(
            ownLike,
          ),

        userId:
          user.id,
      };
    },
  });

  async function toggleLike(
    event: React.MouseEvent,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const {
      data: authData,
    } =
      await supabase.auth.getUser();

    const user =
      authData.user;

    if (!user) {
      toast.info(
        "Ingresa a La Vitrina para dar ❤️.",
      );

      return;
    }

    try {
      if (
        state.data?.liked
      ) {
        const {
          error,
        } =
          await (supabase as any)
            .from("likes")
            .delete()
            .eq(
              "user_id",
              user.id,
            )
            .eq(
              "content_type",
              contentType,
            )
            .eq(
              "content_id",
              contentId,
            );

        if (error) {
          throw error;
        }
      } else {
        const {
          error,
        } =
          await (supabase as any)
            .from("likes")
            .insert({
              user_id:
                user.id,

              content_type:
                contentType,

              content_id:
                contentId,
            });

        if (error) {
          throw error;
        }
      }

      await queryClient.invalidateQueries({
        queryKey: [
          "like-state",
          contentType,
          contentId,
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "like-count",
          contentType,
          contentId,
        ],
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos registrar tu me gusta.",
      );
    }
  }

  const liked =
    state.data?.liked ??
    false;

  const count =
    state.data?.count ??
    0;

  /*
   * REGLA VISUAL:
   * 0 likes  -> corazón neutro
   * 1+ likes -> corazón rojo
   */
  const hasLikes =
    count > 0;

  return (
    <button
      type="button"

      onClick={
        toggleLike
      }

      aria-label={
        liked
          ? "Quitar me gusta"
          : "Dar me gusta"
      }

      title={
        liked
          ? "Quitar me gusta"
          : "Me gusta"
      }

      className={
        compact
          ? `inline-flex h-8 items-center gap-1 rounded-full border bg-background px-2.5 text-xs transition-colors ${
              hasLikes
                ? "border-red-200 text-red-500"
                : "border-border text-muted-foreground hover:text-red-500"
            }`
          : `inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-3 text-sm transition-colors ${
              hasLikes
                ? "border-red-200 text-red-500"
                : "border-border text-muted-foreground hover:text-red-500"
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

      <span
        className={
          hasLikes
            ? "font-semibold text-red-500"
            : ""
        }
      >
        {count}
      </span>
    </button>
  );
}