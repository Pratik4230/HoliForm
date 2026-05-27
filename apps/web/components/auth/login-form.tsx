"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  signInUserWithEmailAndPasswordInputModel,
  type SignInUserWithEmailAndPasswordInput,
} from "@repo/validators/auth";
import { useSignIn } from "~/hooks/api/auth";
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
import { HOLI } from "~/components/auth/holi/holi-colors";

export function LoginForm() {
  const signIn = useSignIn();

  const form = useForm<SignInUserWithEmailAndPasswordInput>({
    resolver: zodResolver(signInUserWithEmailAndPasswordInputModel),
    defaultValues: { email: "", password: "" },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <div
        className="relative overflow-hidden rounded-3xl border-2 p-8 shadow-xl backdrop-blur-md"
        style={{
          borderColor: `${HOLI.pink}44`,
          background: "rgba(255, 255, 255, 0.88)",
          boxShadow: `0 20px 60px ${HOLI.pink}22, 0 8px 24px ${HOLI.yellow}18`,
        }}
      >
        {/* corner gulal accents */}
        <div
          className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full blur-2xl"
          style={{ backgroundColor: `${HOLI.yellow}66` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-8 -right-6 h-24 w-24 rounded-full blur-2xl"
          style={{ backgroundColor: `${HOLI.pink}55` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-4 top-4 h-3 w-3 rounded-full"
          style={{ backgroundColor: HOLI.green }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-10 top-6 h-2 w-2 rounded-full"
          style={{ backgroundColor: HOLI.orange }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-6 top-5 h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: HOLI.hotPink }}
          aria-hidden
        />

        <div className="relative mb-6 text-center">
          <motion.span
            className="mb-3 inline-block text-4xl"
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            🎨
          </motion.span>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange}, ${HOLI.yellow})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            HoliForm
          </h1>
          <p className="mt-2 text-sm text-zinc-600">Welcome back log in and spread the colors!</p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => signIn.mutate(values))}
            className="relative space-y-5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email address"
                      className="border-zinc-200 bg-white/90 focus-visible:ring-[#e91e63]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-700">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="border-zinc-200 bg-white/90 focus-visible:ring-[#e91e63]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full border-0 font-semibold text-white shadow-md transition-transform hover:scale-[1.02] hover:opacity-95 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange})`,
                boxShadow: `0 4px 14px ${HOLI.pink}55`,
              }}
              disabled={signIn.isPending}
            >
              {signIn.isPending ? "Signing in…" : "Log in 🎉"}
            </Button>

            <p className="text-center text-sm text-zinc-500">
              New here?{" "}
              <Link
                href="/signup"
                className="font-semibold underline-offset-4 transition-colors hover:underline"
                style={{ color: HOLI.pink }}
              >
                Create an account
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
