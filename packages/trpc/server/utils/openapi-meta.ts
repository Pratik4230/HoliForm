import type { OpenApiMeta } from "trpc-to-openapi";

type HttpMethod = NonNullable<OpenApiMeta["openapi"]>["method"];

export function publicOpenApiMeta(
  method: HttpMethod,
  path: `/${string}`,
  tags: string[],
): OpenApiMeta {
  return {
    openapi: {
      method,
      path,
      tags,
    },
  };
}

export function protectedOpenApiMeta(
  method: HttpMethod,
  path: `/${string}`,
  tags: string[],
): OpenApiMeta {
  return {
    openapi: {
      method,
      path,
      tags,
      protect: true,
    },
  };
}
