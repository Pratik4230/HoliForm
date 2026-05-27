"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { nanoid } from "nanoid";
import type { ChatStatus } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "~/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "~/components/ai-elements/prompt-input";
import { FormFillExperience } from "~/components/forms/form-fill-experience";
import { HOLI } from "~/components/auth/holi/holi-colors";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { AiFormBuilderActions } from "~/components/dashboard/ai-form-builder-actions";
import { trpc } from "~/trpc/client";
import {
  useAiCreateFormFromPrompt,
  useAiEditFormFromPrompt,
  useListFormThemes,
  type FormByIdOutput,
} from "~/hooks/api/form";
import { AI_FORM_EXAMPLE_PROMPTS } from "~/lib/ai-form-example-prompts";
import { resolveThemeFromPresets } from "~/lib/form-theme-styles";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function AiFormPreviewThankYou({ message, onRestart }: { message: string; onRestart: () => void }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-full text-2xl text-white"
        style={{
          background: `linear-gradient(135deg, ${HOLI.pink}, ${HOLI.orange})`,
        }}
        aria-hidden
      >
        ✓
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold">Preview complete</p>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">
          Preview only — no response was saved to your account.
        </p>
      </div>
      <Button type="button" variant="outline" className="h-10" onClick={onRestart}>
        <RotateCcw className="size-4" />
        Restart preview
      </Button>
    </div>
  );
}

export function AiFormBuilder() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Describe the form you want in plain English. I will build the questions, layout, and theme, then show a live preview. You can keep refining with follow-up messages.",
    },
  ]);
  const [formData, setFormData] = useState<FormByIdOutput | null>(null);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [previewCompleted, setPreviewCompleted] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const lastFormVersion = useRef<string | null>(null);

  const { data: themes } = useListFormThemes();
  const createFromPrompt = useAiCreateFormFromPrompt();
  const editFromPrompt = useAiEditFormFromPrompt();

  const formId = formData?.form.id;
  const { data: liveForm } = trpc.forms.getFormById.useQuery(
    { formId: formId! },
    { enabled: Boolean(formId) },
  );
  const activeForm = liveForm ?? formData;

  const isBusy = createFromPrompt.isPending || editFromPrompt.isPending;

  const chatStatus: ChatStatus = isBusy ? "submitted" : status;

  const sortedFields = useMemo(() => {
    if (!activeForm) return [];
    return [...activeForm.fields].sort((a, b) => Number(a.index) - Number(b.index));
  }, [activeForm]);

  const theme = resolveThemeFromPresets(activeForm?.form.themeId ?? null, themes ?? []);

  const formVersion = activeForm
    ? `${activeForm.form.id}:${activeForm.form.updatedAt}:${activeForm.fields.length}`
    : null;

  useEffect(() => {
    if (!formVersion) return;
    if (lastFormVersion.current === formVersion) return;
    lastFormVersion.current = formVersion;
    setPreviewCompleted(false);
    setPreviewKey((key) => key + 1);
  }, [formVersion]);

  const handlePrompt = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy) return;

      const nextMessages: ChatMessage[] = [
        ...messages,
        { id: nanoid(), role: "user", content: trimmed },
      ];
      const apiMessages = nextMessages.map(({ role, content }) => ({ role, content }));

      setMessages(nextMessages);
      setStatus("submitted");

      try {
        const result = formData
          ? await editFromPrompt.mutateAsync({
              formId: formData.form.id,
              messages: apiMessages,
            })
          : await createFromPrompt.mutateAsync({ messages: apiMessages });

        setFormData(result.form);
        setMessages((prev) => [
          ...prev,
          { id: nanoid(), role: "assistant", content: result.assistantMessage },
        ]);
        setStatus("ready");
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Something went wrong while building your form. Please try again.";
        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(),
            role: "assistant",
            content: message,
          },
        ]);
        setStatus("error");
      }
    },
    [createFromPrompt, editFromPrompt, formData, isBusy, messages],
  );

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 lg:min-h-[calc(100vh-10rem)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 shrink-0" style={{ color: HOLI.pink }} />
            <h1 className="text-xl font-bold sm:text-2xl">AI form builder</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe your form in natural language. Edit anytime with follow-up prompts.
          </p>
        </div>
        {activeForm ? (
          <AiFormBuilderActions
            formData={activeForm}
            fieldCount={sortedFields.length}
            variant="header"
          />
        ) : null}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-background/80 shadow-sm lg:min-h-[560px]">
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="gap-4 p-3 sm:p-4">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  title="Start building"
                  description="Tell me what form you need"
                />
              ) : (
                messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      <MessageResponse>{message.content}</MessageResponse>
                    </MessageContent>
                  </Message>
                ))
              )}
              {isBusy ? (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Spinner className="size-4" />
                      Building your form…
                    </div>
                  </MessageContent>
                </Message>
              ) : null}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {!formData && messages.length <= 1 ? (
            <div className="flex flex-col gap-2 border-t border-border px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">Try an example</p>
              <div className="flex flex-wrap gap-2">
                {AI_FORM_EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example.label}
                    type="button"
                    className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    onClick={() => void handlePrompt(example.prompt)}
                    disabled={isBusy}
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-t border-border p-2 sm:p-3">
            <PromptInput
              onSubmit={({ text }) => {
                void handlePrompt(text);
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  placeholder={
                    formData
                      ? "e.g. Add a phone field and make email optional"
                      : "e.g. Create a Holi feedback form with name, email, and rating"
                  }
                  disabled={isBusy}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <p className="text-xs text-muted-foreground">
                  {activeForm ? `${sortedFields.length} questions` : "New form"}
                </p>
                <PromptInputSubmit status={chatStatus} disabled={isBusy} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>

        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-background/80 shadow-sm lg:min-h-[560px]">
          <div className="space-y-2 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Live preview</p>
              <p className="text-xs text-muted-foreground">
                {activeForm?.form.status === "published"
                  ? "Published form as respondents see it"
                  : "Draft preview (publish to share)"}
              </p>
            </div>
            {activeForm ? (
              <AiFormBuilderActions
                formData={activeForm}
                fieldCount={sortedFields.length}
                variant="preview"
              />
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {!activeForm ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                <Sparkles
                  className="size-10 opacity-60"
                  style={{ color: HOLI.orange }}
                  aria-hidden
                />
                <p className="max-w-xs text-sm text-muted-foreground">
                  Your preview will appear here after you describe your first form.
                </p>
              </div>
            ) : previewCompleted ? (
              <AiFormPreviewThankYou
                message={activeForm.form.thankYouMessage ?? "Thank you for your response!"}
                onRestart={() => {
                  setPreviewCompleted(false);
                  setPreviewKey((key) => key + 1);
                }}
              />
            ) : (
              <>
                <p className="border-b border-dashed border-border bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">
                  Walk through your form here. Submit is preview-only — nothing is saved.
                </p>
                <FormFillExperience
                  key={`${activeForm.form.id}-${previewKey}-${activeForm.form.updatedAt}-${activeForm.form.status}`}
                  form={activeForm.form}
                  fields={sortedFields}
                  theme={theme}
                  mode="preview"
                  onSubmit={async () => {
                    setPreviewCompleted(true);
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
