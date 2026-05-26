import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export function getTrpcHttpUrl() {
  const raw = env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    return "http://localhost:8000/trpc";
  }
  return raw.endsWith("/trpc") ? raw : `${raw.replace(/\/$/, "")}/trpc`;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    url: getTrpcHttpUrl(),
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
