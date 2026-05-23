import { FormResponses } from "~/components/dashboard/form-responses";

type PageProps = {
  params: Promise<{ formId: string }>;
};

export default async function FormResponsesPage({ params }: PageProps) {
  const { formId } = await params;
  return <FormResponses formId={formId} />;
}
