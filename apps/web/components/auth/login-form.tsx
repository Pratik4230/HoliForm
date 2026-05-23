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
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Log in</h1>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => signIn.mutate(values))}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={signIn.isPending}>
              {signIn.isPending ? "Signing in…" : "Log in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
