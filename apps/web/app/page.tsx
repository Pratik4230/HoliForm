import { api } from "~/trpc/server";

export default async function Home() {
  const {message} = await api.chaicode.query({email: "test@test.com"});
  return <div>Hello {message}</div>;
}
