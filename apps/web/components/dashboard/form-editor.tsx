"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Archive,
  ArchiveRestore,
  BarChart3,
  Copy,
  CopyPlus,
  ExternalLink,
  Eye,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  formFieldTypeModel,
  upsertFormFieldInputModel,
  type UpdateFormInput,
  type UpsertFormFieldInput,
} from "@repo/validators/forms";
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
  FormDescription,
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
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { Spinner } from "~/components/ui/spinner";
import { getPublicFormUrl } from "~/lib/form-url";
import { useSession } from "~/hooks/api/auth";
import {
  type EditorField,
  useArchiveForm,
  useCloneForm,
  useDeleteFormField,
  useFormById,
  usePublishForm,
  useReorderFormField,
  useSetFormAcceptingResponses,
  useSetFormVisibility,
  useUnarchiveForm,
  useUnpublishForm,
  useUpdateForm,
  useUpsertFormField,
} from "~/hooks/api/form";
import { formHasMultipleSections } from "~/lib/form-fill-pages";
import { FormThemePicker } from "~/components/forms/form-theme-picker";
import { FormFieldList } from "~/components/dashboard/form-field-list";

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

function buildNewFieldDefaults(formId: string, defaultPageIndex: number): UpsertFormFieldInput {
  return {
    formId,
    label: "",
    labelKey: "",
    type: "text",
    pageIndex: defaultPageIndex,
    isRequired: false,
  };
}

function FieldEditorDialog({
  formId,
  field,
  defaultPageIndex = 0,
  newFieldLabel = "Add field",
  onSaved,
}: {
  formId: string;
  field?: EditorField;
  defaultPageIndex?: number;
  newFieldLabel?: string;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [choicesText, setChoicesText] = useState("");

  const emptyValues = useMemo(
    () => buildNewFieldDefaults(formId, defaultPageIndex),
    [formId, defaultPageIndex],
  );

  const form = useForm<UpsertFormFieldInput>({
    defaultValues: emptyValues,
  });

  const resetDialogState = useCallback(() => {
    if (field) {
      form.reset({
        formId,
        fieldId: field.id,
        label: field.label,
        labelKey: field.labelKey,
        type: field.type,
        pageIndex: field.pageIndex,
        isRequired: field.isRequired,
        description: field.description ?? undefined,
        placeholder: field.placeholder ?? undefined,
        options: field.options ?? undefined,
      });
      setChoicesText(field.options?.choices?.join("\n") ?? "");
    } else {
      form.reset(emptyValues);
      setChoicesText("");
    }
  }, [field, form, formId, emptyValues]);

  useEffect(() => {
    if (open) {
      resetDialogState();
    }
  }, [open, resetDialogState]);

  const upsert = useUpsertFormField({
    formId,
    isEdit: Boolean(field),
    onSuccess: () => {
      setOpen(false);
      onSaved();
    },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && !field) {
      form.reset(emptyValues);
      setChoicesText("");
    }
  };

  const needsChoices = ["select", "radio", "multiselect", "checkbox"].includes(
    form.watch("type"),
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {field ? (
          <Button size="sm" variant="outline" className="rounded-full">
            Edit
          </Button>
        ) : (
          <Button variant={newFieldLabel === "Add section" ? "outline" : "default"}>
            <Plus className="size-4" />
            {newFieldLabel}
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
                  <FormDescription>
                    Unique per form — used to store answers, exports, and analytics. Filled
                    automatically from the label; change only if you need a stable ID.
                  </FormDescription>
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
            <FormField
              control={form.control}
              name="pageIndex"
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <FormDescription>
                    Multi-page forms: questions with the same section number are shown together
                    on one screen (0 = first page). Single-page forms can leave this at 0.
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={f.value ?? 0}
                      onChange={(e) => f.onChange(Number(e.target.value) || 0)}
                    />
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
  const [expiresAtLocal, setExpiresAtLocal] = useState("");
  const [maxResponsesInput, setMaxResponsesInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [clearPassword, setClearPassword] = useState(false);

  const settingsFormSchema = z.object({
    formId: z.string().uuid(),
    title: z.string().min(1),
    description: z.string(),
    slug: z.string().min(1),
    thankYouMessage: z.string(),
  });

  type SettingsFormValues = z.infer<typeof settingsFormSchema>;

  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      formId,
      title: "",
      description: "",
      slug: "",
      thankYouMessage: "",
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
    });
    setExpiresAtLocal(
      data.form.expiresAt
        ? new Date(data.form.expiresAt).toISOString().slice(0, 16)
        : "",
    );
    setMaxResponsesInput(
      data.form.maxResponses != null ? String(data.form.maxResponses) : "",
    );
    setNewPassword("");
    setClearPassword(false);
  }, [data, formId, settingsForm]);

  const updateForm = useUpdateForm(formId);
  const archiveForm = useArchiveForm(formId);
  const unarchiveForm = useUnarchiveForm(formId);
  const publish = usePublishForm(formId);
  const unpublish = useUnpublishForm(formId);
  const setVisibility = useSetFormVisibility(formId);
  const setAccepting = useSetFormAcceptingResponses(formId);
  const deleteField = useDeleteFormField(formId);
  const reorder = useReorderFormField(formId);
  const cloneForm = useCloneForm();

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  const { form, fields } = data;
  const isArchived = Boolean(form.archivedAt);
  const maxPageIndex = fields.reduce((max, field) => Math.max(max, field.pageIndex), 0);
  const showSectionLabels = formHasMultipleSections(fields);
  const username = session.data?.username ?? "";
  const shareUrl =
    form.status === "published" && username
      ? getPublicFormUrl(username, form.slug)
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {isArchived ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/40">
          <p className="font-medium text-amber-900 dark:text-amber-100">
            This form is archived and hidden from respondents.
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={unarchiveForm.isPending}
            onClick={() => unarchiveForm.mutate({ formId })}
          >
            <ArchiveRestore className="size-4" />
            Restore
          </Button>
        </div>
      ) : null}
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
          {!isArchived ? (
            form.status === "published" ? (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => unpublish.mutate({ formId })}
              >
                Unpublish
              </Button>
            ) : (
              <Button onClick={() => publish.mutate({ formId })}>Publish</Button>
            )
          ) : null}
          {!isArchived ? (
            <Button
              variant="outline"
              className="rounded-full"
              disabled={archiveForm.isPending}
              onClick={() => {
                if (confirm(`Archive "${form.title}"? It will be unpublished and hidden.`)) {
                  archiveForm.mutate({ formId });
                }
              }}
            >
              <Archive className="size-4" />
              Archive
            </Button>
          ) : null}
          <Button variant="outline" className="rounded-full" asChild>
            <Link href={`/preview/${formId}`}>
              <Eye className="size-4" />
              Preview
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            disabled={cloneForm.isPending}
            onClick={() => cloneForm.mutate({ formId })}
          >
            <CopyPlus className="size-4" />
            Clone
          </Button>
          {shareUrl ? (
            <>
              <Button variant="outline" className="rounded-full" asChild>
                <a href={shareUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Open live
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
              <div className="flex flex-col items-end gap-2 sm:items-stretch">
                <div className="flex flex-wrap justify-end gap-2">
                  <FieldEditorDialog formId={formId} onSaved={() => void refetch()} />
                  <FieldEditorDialog
                    formId={formId}
                    defaultPageIndex={maxPageIndex + 1}
                    newFieldLabel="Add section"
                    onSaved={() => void refetch()}
                  />
                </div>
                <p className="text-muted-foreground max-w-md text-right text-xs sm:text-left">
                  <span className="font-medium">Add field</span> — question on the current page.{" "}
                  <span className="font-medium">Add section</span> — new page; the section number
                  is set for you.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  Add your first question to start collecting responses.
                </p>
              ) : (
                <FormFieldList
                  fields={fields}
                  showSectionLabels={showSectionLabels}
                  isReordering={reorder.isPending}
                  onReorder={(fieldId, index) => reorder.mutate({ formId, fieldId, index })}
                  onDeleteField={(fieldId) => {
                    if (confirm("Delete this field?")) {
                      deleteField.mutate({ formId, fieldId });
                    }
                  }}
                  renderEditControl={(field) => (
                    <FieldEditorDialog
                      formId={formId}
                      field={field}
                      onSaved={() => void refetch()}
                    />
                  )}
                />
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
                  onSubmit={settingsForm.handleSubmit((values: SettingsFormValues) => {
                    const payload: UpdateFormInput = { ...values };
                    payload.expiresAt = expiresAtLocal ? new Date(expiresAtLocal) : null;
                    const parsedMax = maxResponsesInput.trim()
                      ? Number.parseInt(maxResponsesInput, 10)
                      : null;
                    payload.maxResponses =
                      parsedMax != null && Number.isFinite(parsedMax) && parsedMax > 0
                        ? parsedMax
                        : null;
                    if (clearPassword) {
                      payload.accessPassword = null;
                    } else if (newPassword.trim()) {
                      payload.accessPassword = newPassword.trim();
                    }
                    updateForm.mutate(payload);
                  })}
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
                  <div className="space-y-2">
                    <Label htmlFor="expires-at">Expiry date (optional)</Label>
                    <Input
                      id="expires-at"
                      type="datetime-local"
                      value={expiresAtLocal}
                      onChange={(e) => setExpiresAtLocal(e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs">
                      After this time, the form stops accepting new responses.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-responses">Response limit (optional)</Label>
                    <Input
                      id="max-responses"
                      type="number"
                      min={1}
                      placeholder="Unlimited"
                      value={maxResponsesInput}
                      onChange={(e) => setMaxResponsesInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 rounded-lg border p-4">
                    <p className="font-medium">Access password</p>
                    <p className="text-muted-foreground text-sm">
                      {form.requiresPassword
                        ? "A password is set. Enter a new one to replace it, or clear below."
                        : "Optional password respondents must enter before filling the form."}
                    </p>
                    <Input
                      type="password"
                      placeholder={form.requiresPassword ? "New password" : "Set password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    {form.requiresPassword ? (
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={clearPassword}
                          onCheckedChange={(checked) => setClearPassword(Boolean(checked))}
                        />
                        Remove password protection
                      </label>
                    ) : null}
                  </div>
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
