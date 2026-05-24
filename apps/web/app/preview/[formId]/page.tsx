import type { Metadata } from "next";
import { FormPreview } from "~/components/dashboard/form-preview";

type PageProps = {
  params: Promise<{ formId: string }>;
};

export const metadata: Metadata = {
  title: "Preview form · HoliForm",
  description: "Preview your form before publishing.",
};

export default async function PreviewFormPage({ params }: PageProps) {
  const { formId } = await params;
  return <FormPreview formId={formId} />;
}
