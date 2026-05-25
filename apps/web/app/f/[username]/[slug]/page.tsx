import type { Metadata } from "next";
import { PublicFormFill } from "~/components/forms/public-form-fill";
import {
  buildPublicFormMetadata,
  fetchPublicFormForMetadata,
} from "~/lib/public-form-metadata";

type PageProps = {
  params: Promise<{ username: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const data = await fetchPublicFormForMetadata(username, slug);
  return buildPublicFormMetadata(username, slug, data);
}

export default async function PublicFormPage({ params }: PageProps) {
  const { username, slug } = await params;

  return <PublicFormFill username={username} slug={slug} />;
}
