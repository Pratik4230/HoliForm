import type { Metadata } from "next";
import { PublicFormFill } from "~/components/forms/public-form-fill";

type PageProps = {
  params: Promise<{ username: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  return {
    title: `${slug} · ${username}`,
    description: "Fill out this form",
  };
}

export default async function PublicFormPage({ params }: PageProps) {
  const { username, slug } = await params;

  return <PublicFormFill username={username} slug={slug} />;
}
