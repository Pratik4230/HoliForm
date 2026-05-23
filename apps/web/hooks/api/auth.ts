"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { API_ERROR_CODES } from "@repo/validators/api-errors";
import {
  getApiErrorCode,
  toastIfRateLimited,
  type TrpcClientError,
} from "~/lib/api-error";
import { trpc } from "~/trpc/client";

function toastRateLimitError(error: TrpcClientError): boolean {
  if (!toastIfRateLimited(error)) {
    return false;
  }
  toast.error("Too many attempts. Please wait a few minutes and try again.");
  return true;
}

export function useSession() {
  return trpc.auth.getLoggedInUserInfo.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
}

export function useAuthGuard() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isLoading) {
      return;
    }
    if (session.isError || !session.data) {
      router.replace("/login");
    }
  }, [session.isLoading, session.isError, session.data, router]);

  return session;
}

export function useSignIn() {
  const router = useRouter();
  const utils = trpc.useUtils();

  return trpc.auth.signInUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error, variables) => {
      if (toastRateLimitError(error)) {
        return;
      }
      if (getApiErrorCode(error) === API_ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED) {
        toast.error("Verify your email before logging in.");
        router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
        return;
      }
      toast.error(error.message || "Invalid email or password");
    },
  });
}

export function useSignUp() {
  const router = useRouter();

  return trpc.auth.createUserWithEmailAndPasswordInput.useMutation({
    onSuccess: (data) => {
      toast.success("Check your email for a verification code.");
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    },
    onError: (error) => {
      if (toastRateLimitError(error)) {
        return;
      }
      toast.error(error.message || "Could not create account");
    },
  });
}

export function useVerifyEmail() {
  const router = useRouter();
  const utils = trpc.useUtils();

  return trpc.auth.verifyEmailWithOtp.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
      toast.success("Email verified — welcome to HoliForm!");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      if (toastRateLimitError(error)) {
        return;
      }
      toast.error(error.message || "Invalid or expired code");
    },
  });
}

export function useUpdateEmailNotifications() {
  const utils = trpc.useUtils();

  return trpc.auth.updateEmailNotifications.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });
}

export function useResendVerificationOtp() {
  return trpc.auth.resendEmailVerificationOtp.useMutation({
    onSuccess: () => {
      toast.success("If that account exists, a new code is on its way.");
    },
    onError: (error) => {
      if (toastRateLimitError(error)) {
        return;
      }
      toast.error(error.message || "Could not resend code");
    },
  });
}

export function useSignOut() {
  const router = useRouter();
  const utils = trpc.useUtils();

  return trpc.auth.signOut.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
      toast.success("Signed out");
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Could not sign out");
    },
  });
}
