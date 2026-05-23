"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { useSession, useUpdateEmailNotifications } from "~/hooks/api/auth";

export function AccountSettings() {
  const session = useSession();
  const updateNotifications = useUpdateEmailNotifications();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (session.data) {
      setEnabled(session.data.emailNotificationsEnabled);
    }
  }, [session.data]);

  async function handleToggle(checked: boolean) {
    const previous = enabled;
    setEnabled(checked);
    try {
      await updateNotifications.mutateAsync({ enabled: checked });
      toast.success(
        checked
          ? "You will receive emails when someone submits your forms."
          : "Creator notification emails are turned off.",
      );
    } catch {
      setEnabled(previous);
      toast.error("Could not update notification settings.");
    }
  }

  if (session.isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email notifications</CardTitle>
        <CardDescription>
          When enabled, we email you at {session.data?.email} whenever someone submits one of your
          forms. Respondent thank-you emails are not affected.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <Label htmlFor="email-notifications" className="flex flex-col gap-1">
          <span className="font-medium">New response alerts</span>
          <span className="text-sm font-normal text-muted-foreground">
            {enabled ? "On — you will be notified" : "Off — no creator alert emails"}
          </span>
        </Label>
        <Switch
          id="email-notifications"
          checked={enabled}
          disabled={updateNotifications.isPending}
          onCheckedChange={handleToggle}
        />
      </CardContent>
    </Card>
  );
}
