"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  formFieldTypeModel,
  upsertFormFieldInputModel,
  updateFormInputFormModel,
  type UpdateFormInput,
} from "@repo/validators/forms";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { Spinner } from "~/components/ui/spinner";
import { getPublicFormUrl } from "~/lib/form-url";
import { useSession } from "~/hooks/api/auth";
import {
  type EditorField,
  useDeleteFormField,
  useFormById,
  usePublishForm,
  useReorderFormField,
  useSetFormAcceptingResponses,
  useSetFormVisibility,
  useUnpublishForm,
  useUpdateForm,
  useUpsertFormField,
} from "~/hooks/api/form";
import { FormThemePicker } from "~/components/forms/form-theme-picker";

const FIELD_TYPES = formFieldTypeModel.options;

const FIELD_TYPE_LABELS: Record<(typeof FIELD_TYPES)[number], string> = {
  text: "Short text",
  textarea: "Long text",
  email: "Email",
  number: "Number",
  phone: "Phone",
  date: "Date",
  checkbox: "Checkbox",
  radio: "Multiple choice",
  select: "Dropdown",
  multiselect: "Multi-select",
};

function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 64);
}

function FieldEditorDialog({
  formId,
  field,
  onSaved,
}: {
  formId: string;
  field?: EditorField;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [choicesText, setChoicesText] = useState(
    field?.options?.choices?.join("\n") ?? "",
  );

  const form = useForm({
    defaultValues: field
      ? {
          formId,
          fieldId: field.id,
          label: field.label,
          labelKey: field.labelKey,
          type: field.type,
          isRequired: field.isRequired,
          description: field.description ?? undefined,
          placeholder: field.placeholder ?? undefined,
          options: field.options ?? undefined,
        }
      : {
          formId,
          label: "",
          labelKey: "",
          type: "text" as const,
          isRequired: false,
          description: undefined,
          placeholder: undefined,
          options: undefined,
        },
  });

  const upsert = useUpsertFormField({
    formId,
    isEdit: Boolean(field),
    onSuccess: () => {
      setOpen(false);
      onSaved();
    },
  });

  const needsChoices = ["select", "radio", "multiselect", "checkbox"].includes(
    form.watch("type"),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {field ? (
          <Button size="sm" variant="outline" className="rounded-full">
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Add field
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{field ? "Edit field" : "New field"}</DialogTitle>
          <DialogDescription className="sr-only">
            {field
              ? "Update the label, type, and options for this form field."
              : "Add a new question to your form."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => {
              const choices = choicesText
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);
              upsert.mutate(
                upsertFormFieldInputModel.parse({
                  ...values,
                  isRequired: values.isRequired ?? false,
                  options:
                    needsChoices && choices.length > 0
                      ? { choices }
                      : values.options,
                }),
              );
            })}
          >
            <FormField
              control={form.control}
              name="label"
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      {...f}
                      onChange={(e) => {
                        f.onChange(e);
                        if (!field) {
                          form.setValue("labelKey", slugifyLabel(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="labelKey"
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Answer key</FormLabel>
                  <FormControl>
                    <Input className="font-mono" {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={f.value}
                    onValueChange={(value) => {
                      f.onChange(value);
                      if (!["select", "radio", "multiselect", "checkbox"].includes(value)) {
                        setChoicesText("");
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FIELD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {FIELD_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Help text (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...f} value={f.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="placeholder"
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Placeholder (optional)</FormLabel>
                  <FormControl>
                    <Input {...f} value={f.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {needsChoices ? (
              <div className="space-y-2">
                <Label>Choices (one per line)</Label>
                <p className="text-muted-foreground text-xs">
                  Required for dropdown, multi-select, and multi-option checkbox fields.
                </p>
                <Textarea
                  value={choicesText}
                  onChange={(e) => setChoicesText(e.target.value)}
                  rows={4}
                  placeholder={"Option A\nOption B\nOption C"}
                />
              </div>
            ) : null}
            <FormField
              control={form.control}
              name="isRequired"
              render={({ field: f }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel>Required</FormLabel>
                  <FormControl>
                    <Switch checked={f.value} onCheckedChange={f.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={upsert.isPending}>
                Save field
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function FormEditor({ formId }: { formId: string }) {
  const session = useSession();
  const { data, isLoading, refetch } = useFormById(formId);

  const settingsForm = useForm<UpdateFormInput>({
    resolver: zodResolver(updateFormInputFormModel),
    defaultValues: {
      formId,
      title: "",
      description: "",
      slug: "",
      thankYouMessage: "",
      themeId: null,
    },
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    settingsForm.reset({
      formId,
      title: data.form.title,
      description: data.form.description,
      slug: data.form.slug,
      thankYouMessage: data.form.thankYouMessage ?? "",
      themeId: data.form.themeId,
    });
  }, [data, formId, settingsForm]);

  const updateForm = useUpdateForm(formId);
  const publish = usePublishForm(formId);
  const unpublish = useUnpublishForm(formId);
  const setVisibility = useSetFormVisibility(formId);
  const setAccepting = useSetFormAcceptingResponses(formId);
  const deleteField = useDeleteFormField(formId);
  const reorder = useReorderFormField(formId);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  const { form, fields } = data;
  const username = session.data?.username ?? "";
  const shareUrl =
    form.status === "published" && username
      ? getPublicFormUrl(username, form.slug)
      : null;

  const moveField = (field: EditorField, direction: "up" | "down") => {
    const sorted = [...fields].sort((a, b) => Number(a.index) - Number(b.index));
    const idx = sorted.findIndex((f) => f.id === field.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) {
      return;
    }
    const other = sorted[swapIdx];
    if (!other) {
      return;
    }
    reorder.mutate({ formId, fieldId: field.id, index: other.index });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{form.title}</h1>
          <p className="text-muted-foreground font-mono text-sm">/{form.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href={`/dashboard/forms/${formId}/responses`}>
              <BarChart3 className="size-4" />
              Responses
            </Link>
          </Button>
          {form.status === "published" ? (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => unpublish.mutate({ formId })}
            >
              Unpublish
            </Button>
          ) : (
            <Button
              onClick={() => publish.mutate({ formId })}
            >
              Publish
            </Button>
          )}
          {shareUrl ? (
            <>
              <Button variant="outline" className="rounded-full" asChild>
                <a href={shareUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Preview
                </a>
              </Button>
              <Button
                variant="secondary"
                className="rounded-full"
                onClick={() => {
                  void navigator.clipboard.writeText(shareUrl);
                  toast.success("Link copied");
                }}
              >
                <Copy className="size-4" />
                Copy link
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="fields" className="space-y-4">
        <TabsList className="bg-background/80 h-11 rounded-full p-1">
          <TabsTrigger value="fields" className="rounded-full px-6">
            Fields
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full px-6">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>{fields.length} field(s)</CardDescription>
              </div>
              <FieldEditorDialog formId={formId} onSaved={() => void refetch()} />
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  Add your first question to start collecting responses.
                </p>
              ) : (
                [...fields]
                  .sort((a, b) => Number(a.index) - Number(b.index))
                  .map((field, i) => (
                    <div
                      key={field.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-background/60 p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{field.label}</p>
                        <p className="text-muted-foreground text-xs">
                          {FIELD_TYPE_LABELS[field.type]} ·{" "}
                          <span className="font-mono">{field.labelKey}</span>
                          {field.isRequired ? " · required" : ""}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        #{i + 1}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={i === 0}
                          onClick={() => moveField(field, "up")}
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={i === fields.length - 1}
                          onClick={() => moveField(field, "down")}
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                        <FieldEditorDialog
                          formId={formId}
                          field={field}
                          onSaved={() => void refetch()}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Delete this field?")) {
                              deleteField.mutate({ formId, fieldId: field.id });
                            }
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Form settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...settingsForm}>
                <form
                  className="space-y-4"
                  onSubmit={settingsForm.handleSubmit((values) =>
                    updateForm.mutate(values),
                  )}
                >
                  <FormField
                    control={settingsForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={settingsForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={settingsForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input className="font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={settingsForm.control}
                    name="thankYouMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thank-you message</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">
                    Save settings
                  </Button>
                </form>
              </Form>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="font-medium">Form theme</p>
                  <p className="text-muted-foreground text-sm">
                    Choose how your public form looks to respondents.
                  </p>
                </div>
                <FormThemePicker
                  value={form.themeId}
                  disabled={updateForm.isPending}
                  onChange={(themeId) => {
                    updateForm.mutate({ formId, themeId });
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Visibility</p>
                    <p className="text-muted-foreground text-sm">
                      Public forms can appear in explore later; unlisted is link-only.
                    </p>
                  </div>
                  <Select
                    value={form.visibility}
                    onValueChange={(visibility: "public" | "unlisted") =>
                      setVisibility.mutate({ formId, visibility })
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Accepting responses</p>
                    <p className="text-muted-foreground text-sm">
                      Turn off to close the form without unpublishing.
                    </p>
                  </div>
                  <Switch
                    checked={form.closedAt === null}
                    onCheckedChange={(checked) =>
                      setAccepting.mutate({ formId, acceptingResponses: checked })
                    }
                  />
                </div>
              </div>

              <Button variant="ghost" asChild>
                <Link href="/dashboard">← Back to forms</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
