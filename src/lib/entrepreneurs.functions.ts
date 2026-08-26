import {
  createServerFn,
} from "@tanstack/react-start";

import {
  createClient,
} from "@supabase/supabase-js";

import {
  z,
} from "zod";


const slugInput =
  z.object({
    slug:
      z
        .string()
        .min(1)
        .max(120),
  });


function getEnvironmentValue(
  names: string[],
) {
  for (
    const name of names
  ) {
    const value =
      process.env[name];

    if (value) {
      return value;
    }
  }

  return undefined;
}


function publicClient() {
  const url =
    getEnvironmentValue([
      "SUPABASE_URL",
      "VITE_SUPABASE_URL",
    ]);

  const key =
    getEnvironmentValue([
      "SUPABASE_PUBLISHABLE_KEY",
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    ]);

  if (!url || !key) {
    throw new Error(
      "No se encontraron las variables de conexión a Supabase.",
    );
  }

  return createClient(
    url,
    key,
    {
      auth: {
        persistSession:
          false,

        autoRefreshToken:
          false,
      },

      global: {
        fetch:
          (
            input,
            init,
          ) => {
            const headers =
              new Headers(
                init?.headers,
              );

            if (
              key.startsWith(
                "sb_",
              ) &&
              headers.get(
                "Authorization",
              ) ===
                `Bearer ${key}`
            ) {
              headers.delete(
                "Authorization",
              );
            }

            headers.set(
              "apikey",
              key,
            );

            return fetch(
              input,
              {
                ...init,
                headers,
              },
            );
          },
      },
    },
  );
}


export const getEntrepreneurBySlug =
  createServerFn({
    method:
      "GET",
  })
    .inputValidator(
      (
        data:
          unknown,
      ) =>
        slugInput.parse(
          data,
        ),
    )
    .handler(
      async ({
        data,
      }) => {
        const supabase =
          publicClient();

        const {
          data:
            row,

          error,
        } =
          await supabase
            .from(
              "entrepreneurs",
            )
            .select(`
              *,
              categories:category_id(
                name,
                slug
              ),
              activities:activity_id(
                name,
                slug
              ),
              comunas:comuna_id(
                name,
                slug
              )
            `)
            .eq(
              "slug",
              data.slug,
            )
            .eq(
              "status",
              "aprobado",
            )
            .eq(
              "visible",
              true,
            )
            .maybeSingle();

        if (error) {
          console.error(
            "Error cargando emprendimiento:",
            error.message,
          );

          throw new Error(
            error.message,
          );
        }

        if (!row) {
          return null;
        }

        const {
          data:
            products,

          error:
            productsError,
        } =
          await supabase
            .from(
              "products",
            )
            .select(
              "*",
            )
            .eq(
              "entrepreneur_id",
              row.id,
            )
            .order(
              "sort_order",
            );

        if (
          productsError
        ) {
          console.error(
            "Error cargando productos:",
            productsError.message,
          );
        }

        return {
          entrepreneur:
            row,

          products:
            products ??
            [],
        };
      },
    );