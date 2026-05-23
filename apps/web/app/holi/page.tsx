import type { Metadata } from "next";
import { HoliForm } from "~/components/holi/holi-form";

export const metadata: Metadata = {
  title: "Multi-step Form",
  description: "A simple multi-step form.",
};

export default function FormPage() {
  return <HoliForm />;
}
