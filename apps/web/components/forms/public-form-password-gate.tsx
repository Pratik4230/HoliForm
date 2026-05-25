"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { API_ERROR_CODES } from "@repo/validators/api-errors";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { getApiErrorCode } from "~/lib/api-error";
import { saveFormAccessPassword } from "~/lib/form-access-storage";
import { trpc } from "~/trpc/client";

type PublicFormPasswordGateProps = {
  username: string;
  slug: string;
  title: string;
  onUnlocked: (password: string) => void;
};

export function PublicFormPasswordGate({
  username,
  slug,
  title,
  onUnlocked,
}: PublicFormPasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const verify = trpc.forms.verifyFormAccess.useMutation({
    onSuccess: (data) => {
      if (!data.valid) {
        setError("Incorrect password. Please try again.");
        return;
      }
      saveFormAccessPassword(username, slug, password);
      onUnlocked(password);
    },
    onError: (err) => {
      const code = getApiErrorCode(err);
      if (code === API_ERROR_CODES.FORM_NOT_FOUND) {
        setError("This form is not available.");
        return;
      }
      setError(err.message || "Could not verify password.");
    },
  });

  return (
    <Card className="mx-auto mt-16 max-w-md">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
          <Lock className="size-5 text-muted-foreground" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>This form is password-protected. Enter the password to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            if (!password.trim()) {
              setError("Enter the form password.");
              return;
            }
            verify.mutate({ username, slug, password });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="form-access-password">Password</Label>
            <Input
              id="form-access-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={verify.isPending}>
            {verify.isPending ? (
              <>
                <Spinner className="size-4" />
                Checking…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
