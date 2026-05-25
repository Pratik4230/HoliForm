import type { Metadata } from "next";
import type { RouterOutputs } from "@repo/trpc/client";
import { api } from "~/trpc/server";
import { getPublicFormAbsoluteUrl } from "~/lib/site-url";

type PublicFormData = RouterOutputs["forms"]["getPublicForm"];

export async function fetchPublicFormForMetadata(
  username: string,
  slug: string,
): Promise<PublicFormData | null> {
  try {
    return await api.forms.getPublicForm.query({ username, slug });
  } catch {
    return null;
  }
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

export function buildPublicFormMetadata(
  username: string,
  slug: string,
  data: PublicFormData | null,
): Metadata {
  const url = getPublicFormAbsoluteUrl(username, slug);

  if (!data) {
    return {
      title: "Form unavailable · HoliForm",
      description: "This form is not published, closed, or does not exist.",
      robots: { index: false, follow: false },
      openGraph: {
        title: "Form unavailable",
        description: "This form cannot be opened.",
        url,
        siteName: "HoliForm",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Form unavailable",
        description: "This form cannot be opened.",
      },
    };
  }

  const { form } = data;
  const title = form.title.trim() || "Untitled form";
  const description = truncate(
    form.description?.trim() ||
      `Fill out "${title}" — no account needed. Shared by @${username} on HoliForm.`,
    200,
  );

  const openGraphTitle = truncate(title, 70);

  return {
    title: `${title} · HoliForm`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: openGraphTitle,
      description,
      url,
      siteName: "HoliForm",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: openGraphTitle,
      description,
    },
  };
}

export function buildThankYouMetadata(
  username: string,
  slug: string,
  data: PublicFormData | null,
  thankYouMessage?: string,
): Metadata {
  const formUrl = getPublicFormAbsoluteUrl(username, slug);
  const title = data?.form.title?.trim() || "Form";
  const description = truncate(
    thankYouMessage?.trim() || data?.form.thankYouMessage?.trim() || "Thank you for your response!",
    160,
  );

  return {
    title: `Thank you · ${title}`,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: `Thank you · ${truncate(title, 60)}`,
      description,
      url: formUrl,
      siteName: "HoliForm",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Thank you · ${truncate(title, 60)}`,
      description,
    },
  };
}
