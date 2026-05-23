"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";

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
    onError: (error) => {
      toast.error(error.message || "Invalid email or password");
    },
  });
}

export function useSignUp() {
  const router = useRouter();
  const utils = trpc.useUtils();

  return trpc.auth.createUserWithEmailAndPasswordInput.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
      toast.success("Account created — let's build!");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Could not create account");
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

