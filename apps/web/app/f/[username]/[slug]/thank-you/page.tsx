import type { Metadata } from "next";
import { ThankYouView } from "~/components/forms/thank-you-view";
import {
  buildThankYouMetadata,
  fetchPublicFormForMetadata,
} from "~/lib/public-form-metadata";

type PageProps = {
  params: Promise<{ username: string; slug: string }>;
  searchParams: Promise<{ message?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const { message } = await searchParams;
  const data = await fetchPublicFormForMetadata(username, slug);
  return buildThankYouMetadata(username, slug, data, message);
}

export default async function ThankYouPage({ params, searchParams }: PageProps) {
  const { username, slug } = await params;
  const { message } = await searchParams;

  return (
    <ThankYouView
      username={username}
      slug={slug}
      message={message ?? "Thank you for your response!"}
    />
  );
}
