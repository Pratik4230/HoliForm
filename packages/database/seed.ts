/**
 * Demo seed for judges / local development.
 * Idempotent: removes prior demo user (cascade) then recreates.
 *
 * Run: pnpm db:seed
 */
import { createHmac } from "node:crypto";
import { eq } from "drizzle-orm";

import db from "./index";
import { formFieldsTable } from "./models/formField";
import { formResponseAnswersTable, formResponsesTable } from "./models/formResponse";
import { formsTable } from "./models/form";
import { usersTable } from "./models/user";
import { ensureFormThemePresets } from "./seed-form-themes";

export const DEMO_USER = {
  email: "demo@holiform.app",
  password: "DemoForm123!",
  username: "holiform_demo",
  fullName: "HoliForm Demo",
} as const;

function hashPassword(password: string, salt: string) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

async function clearDemoUser() {
  const rows = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, DEMO_USER.email));
  if (rows[0]) {
    await db.delete(usersTable).where(eq(usersTable.id, rows[0].id));
  }
}

type SeedField = {
  label: string;
  labelKey: string;
  type: (typeof formFieldsTable.$inferInsert)["type"];
  index: string;
  pageIndex?: number;
  isRequired?: boolean;
  options?: { choices?: string[] };
  placeholder?: string;
};

type SeedForm = {
  title: string;
  description: string;
  slug: string;
  visibility: "public" | "unlisted";
  themeId: string;
  thankYouMessage: string;
  fields: SeedField[];
  responses: Array<Record<string, unknown>>;
};

const DEMO_FORMS: SeedForm[] = [
  {
    title: "Holi Festival Feedback",
    description: "Tell us how your Holi celebration went — quick pulse survey.",
    slug: "holi-festival-feedback",
    visibility: "public",
    themeId: "holi-gulal",
    thankYouMessage: "Thank you! May your year be as colorful as Holi.",
    fields: [
      {
        label: "Your name",
        labelKey: "name",
        type: "text",
        index: "1000",
        isRequired: true,
      },
      {
        label: "Email",
        labelKey: "email",
        type: "email",
        index: "2000",
        isRequired: true,
      },
      {
        label: "How was the event?",
        labelKey: "rating",
        type: "select",
        index: "3000",
        isRequired: true,
        options: { choices: ["Amazing", "Good", "Okay", "Could be better"] },
      },
      {
        label: "Favorite color of gulal",
        labelKey: "favorite_color",
        type: "radio",
        index: "4000",
        options: { choices: ["Magenta", "Cyan", "Saffron", "Green"] },
      },
    ],
    responses: [
      { name: "Aarav", email: "aarav@example.com", rating: "Amazing", favorite_color: "Magenta" },
      { name: "Priya", email: "priya@example.com", rating: "Good", favorite_color: "Cyan" },
      { name: "Rohan", email: "rohan@example.com", rating: "Okay", favorite_color: "Saffron" },
    ],
  },
  {
    title: "Startup Idea Validator",
    description: "Share your SaaS idea — we use this for demo analytics.",
    slug: "startup-idea-validator",
    visibility: "public",
    themeId: "startup-slate",
    thankYouMessage: "Thanks — your idea is in our demo dataset!",
    fields: [
      {
        label: "Founder name",
        labelKey: "founder_name",
        type: "text",
        index: "1000",
        isRequired: true,
      },
      {
        label: "One-line pitch",
        labelKey: "pitch",
        type: "textarea",
        index: "2000",
        isRequired: true,
      },
      {
        label: "Target market",
        labelKey: "market",
        type: "select",
        index: "3000",
        options: { choices: ["B2B", "B2C", "Prosumer", "Enterprise"] },
      },
      {
        label: "Team size",
        labelKey: "team_size",
        type: "number",
        index: "4000",
      },
    ],
    responses: [
      {
        founder_name: "Sam",
        pitch: "Typeform-style forms for Indian SMBs",
        market: "B2B",
        team_size: 3,
      },
      {
        founder_name: "Jordan",
        pitch: "AI form analytics",
        market: "Prosumer",
        team_size: 2,
      },
    ],
  },
  {
    title: "Anime Watchlist 2026",
    description: "Community poll — which shows should we marathon next?",
    slug: "anime-watchlist-2026",
    visibility: "public",
    themeId: "anime-pop",
    thankYouMessage: "Your taste is legendary. See you on explore!",
    fields: [
      {
        label: "Discord handle",
        labelKey: "handle",
        type: "text",
        index: "1000",
      },
      {
        label: "Pick up to 3 genres",
        labelKey: "genres",
        type: "multiselect",
        index: "2000",
        options: { choices: ["Shonen", "Slice of life", "Mecha", "Isekai", "Sports"] },
      },
      {
        label: "Must-watch this season?",
        labelKey: "must_watch",
        type: "checkbox",
        index: "3000",
        options: { choices: ["Yes", "Already watching"] },
      },
    ],
    responses: [
      { handle: "otaku_42", genres: ["Shonen", "Isekai"], must_watch: ["Yes"] },
      { handle: "sakura_fan", genres: ["Slice of life"], must_watch: ["Already watching"] },
      { handle: "mecha_pilot", genres: ["Mecha", "Sports"], must_watch: ["Yes"] },
    ],
  },
  {
    title: "Team Retro (Unlisted)",
    description: "Internal sprint retro — link only, hidden from explore.",
    slug: "team-retro-unlisted",
    visibility: "unlisted",
    themeId: "midnight-os",
    thankYouMessage: "Retro notes saved. Keep shipping!",
    fields: [
      {
        label: "What went well?",
        labelKey: "went_well",
        type: "textarea",
        index: "1000",
        isRequired: true,
      },
      {
        label: "What to improve?",
        labelKey: "improve",
        type: "textarea",
        index: "2000",
      },
      {
        label: "Sprint mood",
        labelKey: "mood",
        type: "select",
        index: "3000",
        options: { choices: ["Energized", "Steady", "Tired but proud"] },
      },
    ],
    responses: [
      { went_well: "Shipped form builder drag-and-drop", improve: "More E2E tests", mood: "Energized" },
    ],
  },
];

async function seedForm(userId: string, spec: SeedForm) {
  const [form] = await db
    .insert(formsTable)
    .values({
      userId,
      title: spec.title,
      description: spec.description,
      slug: spec.slug,
      status: "published",
      visibility: spec.visibility,
      themeId: spec.themeId,
      thankYouMessage: spec.thankYouMessage,
    })
    .returning({ id: formsTable.id });

  if (!form) {
    throw new Error(`Failed to create form: ${spec.slug}`);
  }

  const fieldIdByKey = new Map<string, string>();

  for (const field of spec.fields) {
    const [row] = await db
      .insert(formFieldsTable)
      .values({
        formId: form.id,
        label: field.label,
        labelKey: field.labelKey,
        type: field.type,
        index: field.index,
        pageIndex: field.pageIndex ?? 0,
        isRequired: field.isRequired ?? false,
        placeholder: field.placeholder ?? null,
        options: field.options ?? null,
      })
      .returning({ id: formFieldsTable.id, labelKey: formFieldsTable.labelKey });

    if (row) {
      fieldIdByKey.set(row.labelKey, row.id);
    }
  }

  for (const answers of spec.responses) {
    const [response] = await db
      .insert(formResponsesTable)
      .values({
        formId: form.id,
        respondentIp: "127.0.0.1",
        metadata: { source: "seed" },
      })
      .returning({ id: formResponsesTable.id });

    if (!response) {
      continue;
    }

    for (const [labelKey, value] of Object.entries(answers)) {
      const fieldId = fieldIdByKey.get(labelKey);
      if (!fieldId) {
        continue;
      }
      await db.insert(formResponseAnswersTable).values({
        responseId: response.id,
        fieldId,
        value,
      });
    }
  }

  return form.id;
}

async function main() {
  console.log("Ensuring theme presets…");
  await ensureFormThemePresets();

  console.log("Resetting demo user (if exists)…");
  await clearDemoUser();

  const salt = "demo-seed-salt-fixed";
  const passwordHash = hashPassword(DEMO_USER.password, salt);

  const [user] = await db
    .insert(usersTable)
    .values({
      username: DEMO_USER.username,
      fullName: DEMO_USER.fullName,
      email: DEMO_USER.email,
      emailVerified: true,
      emailNotificationsEnabled: true,
      salt,
      password: passwordHash,
    })
    .returning({ id: usersTable.id });

  if (!user) {
    throw new Error("Failed to create demo user");
  }

  console.log(`Created demo user: ${DEMO_USER.email}`);

  for (const formSpec of DEMO_FORMS) {
    const formId = await seedForm(user.id, formSpec);
    console.log(`  · ${formSpec.visibility} form "${formSpec.title}" (${formId})`);
  }

  console.log("\nDemo ready.");
  console.log(`  Login:  ${DEMO_USER.email}`);
  console.log(`  Password: ${DEMO_USER.password}`);
  console.log(`  Public fill example: /f/${DEMO_USER.username}/holi-festival-feedback`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
