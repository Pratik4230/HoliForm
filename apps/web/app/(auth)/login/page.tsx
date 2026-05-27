import { HoliLoginScene } from "~/components/auth/holi/holi-login-scene";
import { LoginForm } from "~/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <HoliLoginScene />
      <div className="relative z-10 flex w-full justify-center">
        <LoginForm />
      </div>
    </>
  );
}
