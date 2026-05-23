import { FormEditor } from "~/components/dashboard/form-editor";

type PageProps = {
  params: Promise<{ formId: string }>;
};

export default async function EditFormPage({ params }: PageProps) {
  const { formId } = await params;
  return <FormEditor formId={formId} />;
}
