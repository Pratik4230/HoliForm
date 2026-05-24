import { ThankYouView } from "~/components/forms/thank-you-view";

type PageProps = {
  params: Promise<{ username: string; slug: string }>;
  searchParams: Promise<{ message?: string }>;
};

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
