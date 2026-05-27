import { SignupForm } from "~/components/auth/signup-form";
import { HoliLoginScene } from "~/components/auth/holi/holi-login-scene";

export default function SignupPage() {
  return (
    <>
      <HoliLoginScene />
      <div className="relative z-10 flex w-full justify-center">
        <SignupForm />
      </div>
    </>
  );
}
