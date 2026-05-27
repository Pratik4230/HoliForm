"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  createUserWithEmailAndPasswordInputModel,
  type CreateUserWithEmailAndPasswordInput,
} from "@repo/validators/auth";
import { useSignUp } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { HOLI } from "~/components/auth/holi/holi-colors";

export function SignupForm() {
  const signUp = useSignUp();

  const form = useForm<CreateUserWithEmailAndPasswordInput>({
    resolver: zodResolver(createUserWithEmailAndPasswordInputModel),
    defaultValues: { username: "", fullName: "", email: "", password: "" },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <div
        className="relative overflow-hidden rounded-3xl border-2 p-4 shadow-xl backdrop-blur-md sm:p-8"
        style={{
          borderColor: `${HOLI.yellow}44`,
          background: "rgba(255, 255, 255, 0.88)",
          boxShadow: `0 20px 60px ${HOLI.yellow}22, 0 8px 24px ${HOLI.pink}18`,
        }}
      >
        {/* corner gulal accents */}
        <div
          className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full blur-2xl"
          style={{ backgroundColor: `${HOLI.orange}55` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-8 -right-6 h-24 w-24 rounded-full blur-2xl"
          style={{ backgroundColor: `${HOLI.yellow}66` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-4 top-4 h-3 w-3 rounded-full"
          style={{ backgroundColor: HOLI.hotPink }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-10 top-6 h-2 w-2 rounded-full"
          style={{ backgroundColor: HOLI.green }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-6 top-5 h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: HOLI.orange }}
          aria-hidden
        />

        <div className="relative mb-6 text-center">
          <motion.span
            className="mb-3 inline-block text-4xl"
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            🪅
          </motion.span>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              background: `linear-gradient(135deg, ${HOLI.yellow}, ${HOLI.orange}, ${HOLI.pink})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Create your account
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Join in build and share forms with Holi energy.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => signUp.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-700">Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Full name"
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-700">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      className="border-zinc-200 bg-white/90 font-mono focus-visible:ring-[#e91e63]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Lowercase letters, numbers, underscores only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      placeholder="Min. 8 characters"
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
              className="mt-2 w-full border-0 font-semibold text-white shadow-md transition-transform hover:scale-[1.02] hover:opacity-95 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${HOLI.orange}, ${HOLI.pink})`,
                boxShadow: `0 4px 14px ${HOLI.orange}55`,
              }}
              disabled={signUp.isPending}
            >
              {signUp.isPending ? "Creating…" : "Create account 🎊"}
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold underline-offset-4 transition-colors hover:underline"
                style={{ color: HOLI.pink }}
              >
                Log in
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
