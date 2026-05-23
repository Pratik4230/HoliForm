"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createFormInputModel } from "@repo/validators/forms";
import { useCreateForm } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { Textarea } from "~/components/ui/textarea";
export function CreateFormForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(createFormInputModel),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const createForm = useCreateForm({
    onSuccess: (created) => {
      router.push(`/dashboard/forms/${created.id}`);
    },
  });

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>New form</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
            createForm.mutate(createFormInputModel.parse(values)),
          )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Form title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Short description (optional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="my-form" className="font-mono" {...field} />
                  </FormControl>
                  <FormDescription>Auto-generated from title if left blank.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={createForm.isPending}
            >
              {createForm.isPending ? "Creating…" : "Create & edit fields"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
