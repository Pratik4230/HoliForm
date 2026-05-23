import { CreateFormForm } from "~/components/dashboard/create-form-form";

export default function NewFormPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Create a form</h1>
      <CreateFormForm />
    </div>
  );
}
