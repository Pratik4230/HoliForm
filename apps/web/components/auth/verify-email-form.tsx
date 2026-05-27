"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { verifyEmailWithOtpInputModel, type VerifyEmailWithOtpInput } from "@repo/validators/auth";
import { useResendVerificationOtp, useVerifyEmail } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";
  const verifyEmail = useVerifyEmail();
  const resendOtp = useResendVerificationOtp();
  const [email, setEmail] = useState(emailFromQuery);

  const form = useForm<VerifyEmailWithOtpInput>({
    resolver: zodResolver(verifyEmailWithOtpInputModel),
    defaultValues: { email: emailFromQuery, code: "" },
  });

  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      form.setValue("email", emailFromQuery);
    }
  }, [emailFromQuery, form]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code{email ? ` to ${email}` : ""}. Enter it below to finish signing
            up.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => verifyEmail.mutate(values))}
            className="space-y-5"
          >
            {!emailFromQuery ? (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email address"
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);
                          setEmail(event.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <input type="hidden" {...form.register("email")} />
            )}

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={verifyEmail.isPending || form.watch("code").length !== 6}
            >
              {verifyEmail.isPending ? "Verifying…" : "Verify & continue"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={resendOtp.isPending || !form.watch("email")}
              onClick={() => {
                const targetEmail = form.getValues("email");
                if (!targetEmail) {
                  return;
                }
                resendOtp.mutate({ email: targetEmail });
              }}
            >
              {resendOtp.isPending ? "Sending…" : "Resend code"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Wrong email?{" "}
              <button
                type="button"
                className="font-semibold text-foreground underline-offset-4 hover:underline"
                onClick={() => router.push("/signup")}
              >
                Sign up again
              </button>{" "}
              or{" "}
              <Link
                href="/login"
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                log in
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
