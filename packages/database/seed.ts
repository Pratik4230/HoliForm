/**
 * Demo seed for judges / local development.
 * Wipes all users (cascades forms, fields, responses) then inserts fresh demo data.
 *
 * Run: pnpm db:seed
 */
import { createHmac } from "node:crypto";

import db from "./index";
import { formFieldsTable } from "./models/formField";
import { formResponseAnswersTable, formResponsesTable } from "./models/formResponse";
import { formsTable } from "./models/form";
import { usersTable } from "./models/user";
import { ensureFormThemePresets } from "./seed-form-themes";

export const DEMO_USERS = [
  {
    email: "demo@holiform.app",
    password: "DemoForm123!",
    username: "holiform_demo",
    fullName: "HoliForm Demo",
  },
  {
    email: "events@holiform.app",
    password: "DemoForm123!",
    username: "rangoli_events",
    fullName: "Rangoli Events Co.",
  },
] as const;

function hashPassword(password: string, salt: string) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

async function wipeAllData() {
  console.log("Wiping all users and related data...");
  await db.delete(usersTable);
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
  description?: string;
};

type SeedForm = {
  title: string;
  description: string;
  slug: string;
  visibility: "public" | "unlisted";
  status?: "draft" | "published";
  themeId: string;
  thankYouMessage: string;
  fields: SeedField[];
  responses: Array<Record<string, unknown>>;
};

const DEMO_FORMS_BY_USER: Record<string, SeedForm[]> = {
  holiform_demo: [
    {
      title: "Holi Festival Feedback",
      description: "Tell us how your Holi celebration went. Quick pulse survey.",
      slug: "holi-festival-feedback",
      visibility: "public",
      themeId: "holi-gulal",
      thankYouMessage: "Thank you! May your year be as colorful as Holi.",
      fields: [
        { label: "Your name", labelKey: "name", type: "text", index: "1000", isRequired: true },
        { label: "Email", labelKey: "email", type: "email", index: "2000", isRequired: true },
        {
          label: "How was the event?",
          labelKey: "rating",
          type: "select",
          index: "3000",
          isRequired: true,
          options: { choices: ["Amazing", "Good", "Okay", "Could be better"] },
        },
        {
          label: "Favorite gulal color",
          labelKey: "favorite_color",
          type: "radio",
          index: "4000",
          options: { choices: ["Pink", "Saffron", "Green", "Orange"] },
        },
        {
          label: "Would you join again next year?",
          labelKey: "join_again",
          type: "radio",
          index: "5000",
          options: { choices: ["Definitely", "Maybe", "Not sure"] },
        },
      ],
      responses: [
        { name: "Aarav Sharma", email: "aarav@example.com", rating: "Amazing", favorite_color: "Pink", join_again: "Definitely" },
        { name: "Priya Nair", email: "priya@example.com", rating: "Good", favorite_color: "Saffron", join_again: "Definitely" },
        { name: "Rohan Mehta", email: "rohan@example.com", rating: "Okay", favorite_color: "Green", join_again: "Maybe" },
        { name: "Sneha Iyer", email: "sneha@example.com", rating: "Amazing", favorite_color: "Orange", join_again: "Definitely" },
        { name: "Vikram Patel", email: "vikram@example.com", rating: "Good", favorite_color: "Pink", join_again: "Maybe" },
        { name: "Ananya Das", email: "ananya@example.com", rating: "Could be better", favorite_color: "Saffron", join_again: "Not sure" },
        { name: "Kabir Singh", email: "kabir@example.com", rating: "Amazing", favorite_color: "Green", join_again: "Definitely" },
        { name: "Meera Joshi", email: "meera@example.com", rating: "Good", favorite_color: "Orange", join_again: "Definitely" },
      ],
    },
    {
      title: "Startup Idea Validator",
      description: "Share your SaaS idea. We use this for demo analytics.",
      slug: "startup-idea-validator",
      visibility: "public",
      themeId: "minimal-slate",
      thankYouMessage: "Thanks! Your idea is in our demo dataset.",
      fields: [
        { label: "Founder name", labelKey: "founder_name", type: "text", index: "1000", isRequired: true },
        { label: "Work email", labelKey: "email", type: "email", index: "2000", isRequired: true },
        { label: "One-line pitch", labelKey: "pitch", type: "textarea", index: "3000", isRequired: true },
        {
          label: "Target market",
          labelKey: "market",
          type: "select",
          index: "4000",
          options: { choices: ["B2B", "B2C", "Prosumer", "Enterprise"] },
        },
        { label: "Team size", labelKey: "team_size", type: "number", index: "5000" },
        {
          label: "Stage",
          labelKey: "stage",
          type: "radio",
          index: "6000",
          options: { choices: ["Idea", "MVP", "Revenue", "Scaling"] },
        },
      ],
      responses: [
        { founder_name: "Sam Lee", email: "sam@startup.io", pitch: "Typeform-style forms for Indian SMBs", market: "B2B", team_size: 3, stage: "MVP" },
        { founder_name: "Jordan Kim", email: "jordan@startup.io", pitch: "AI form analytics for creators", market: "Prosumer", team_size: 2, stage: "Idea" },
        { founder_name: "Riya Kapoor", email: "riya@startup.io", pitch: "Voice-first surveys for tier-2 cities", market: "B2C", team_size: 5, stage: "Revenue" },
        { founder_name: "Alex Chen", email: "alex@startup.io", pitch: "Compliance forms for fintech", market: "Enterprise", team_size: 12, stage: "Scaling" },
        { founder_name: "Noah Brooks", email: "noah@startup.io", pitch: "WhatsApp form distribution", market: "B2B", team_size: 4, stage: "MVP" },
      ],
    },
    {
      title: "Community Holi Potluck RSVP",
      description: "Sign up for our housing society Holi potluck and color games.",
      slug: "holi-potluck-rsvp",
      visibility: "public",
      themeId: "holi-saffron",
      thankYouMessage: "See you on the terrace! Bring your water balloons.",
      fields: [
        { label: "Full name", labelKey: "name", type: "text", index: "1000", isRequired: true },
        { label: "Flat / block number", labelKey: "flat", type: "text", index: "2000", isRequired: true },
        {
          label: "What are you bringing?",
          labelKey: "dish",
          type: "select",
          index: "3000",
          options: { choices: ["Snacks", "Main course", "Dessert", "Drinks only"] },
        },
        {
          label: "Activities you want",
          labelKey: "activities",
          type: "multiselect",
          index: "4000",
          options: { choices: ["Water balloons", "Gulal", "Music", "Photo booth"] },
        },
        {
          label: "Guest count (including you)",
          labelKey: "guests",
          type: "number",
          index: "5000",
          isRequired: true,
        },
      ],
      responses: [
        { name: "Divya Rao", flat: "A-402", dish: "Dessert", activities: ["Gulal", "Music"], guests: 2 },
        { name: "Arjun Pillai", flat: "B-108", dish: "Snacks", activities: ["Water balloons", "Gulal"], guests: 4 },
        { name: "Kavya Menon", flat: "C-205", dish: "Main course", activities: ["Music", "Photo booth"], guests: 3 },
        { name: "Harsh Verma", flat: "D-301", dish: "Drinks only", activities: ["Water balloons"], guests: 1 },
        { name: "Isha Gupta", flat: "A-110", dish: "Dessert", activities: ["Gulal", "Photo booth"], guests: 2 },
        { name: "Nikhil Shah", flat: "B-512", dish: "Snacks", activities: ["Gulal", "Music", "Photo booth"], guests: 5 },
      ],
    },
    {
      title: "Product NPS Survey",
      description: "How likely are you to recommend HoliForm to a friend?",
      slug: "product-nps",
      visibility: "public",
      themeId: "minimal-white",
      thankYouMessage: "Your feedback helps us improve the builder.",
      fields: [
        { label: "Email (optional)", labelKey: "email", type: "email", index: "1000" },
        {
          label: "NPS score (0-10)",
          labelKey: "nps",
          type: "number",
          index: "2000",
          isRequired: true,
          placeholder: "10",
        },
        {
          label: "Primary use case",
          labelKey: "use_case",
          type: "radio",
          index: "3000",
          options: { choices: ["Events", "Research", "Lead gen", "Internal ops"] },
        },
        { label: "What should we build next?", labelKey: "feedback", type: "textarea", index: "4000" },
      ],
      responses: [
        { email: "user1@example.com", nps: 9, use_case: "Events", feedback: "More theme presets!" },
        { email: "user2@example.com", nps: 10, use_case: "Lead gen", feedback: "Webhook integrations" },
        { email: "user3@example.com", nps: 7, use_case: "Research", feedback: "Better mobile editor" },
        { nps: 8, use_case: "Internal ops", feedback: "CSV export filters" },
        { email: "user5@example.com", nps: 6, use_case: "Events", feedback: "Faster preview load" },
        { email: "user6@example.com", nps: 10, use_case: "Lead gen", feedback: "Love the Holi themes" },
      ],
    },
    {
      title: "Open Source Contributor Intake",
      description: "Tell us how you want to contribute to HoliForm.",
      slug: "oss-contributor-intake",
      visibility: "public",
      themeId: "holi-pani",
      thankYouMessage: "Thanks for raising your hand! We will reach out on GitHub.",
      fields: [
        { label: "GitHub username", labelKey: "github", type: "text", index: "1000", isRequired: true },
        { label: "Email", labelKey: "email", type: "email", index: "2000", isRequired: true },
        {
          label: "Areas of interest",
          labelKey: "areas",
          type: "multiselect",
          index: "3000",
          options: { choices: ["Frontend", "Backend", "Docs", "Design", "QA"] },
        },
        {
          label: "Hours per week",
          labelKey: "hours",
          type: "select",
          index: "4000",
          options: { choices: ["1-2", "3-5", "5-10", "10+"] },
        },
      ],
      responses: [
        { github: "devpriya", email: "priya@oss.dev", areas: ["Frontend", "Docs"], hours: "3-5" },
        { github: "codevikram", email: "vikram@oss.dev", areas: ["Backend", "QA"], hours: "5-10" },
        { github: "ui-meera", email: "meera@oss.dev", areas: ["Design", "Frontend"], hours: "1-2" },
        { github: "docs-kabir", email: "kabir@oss.dev", areas: ["Docs"], hours: "3-5" },
      ],
    },
    {
      title: "College Fest Volunteer Sign-up",
      description: "Multi-step sign-up for campus Holi fest volunteers.",
      slug: "college-fest-volunteers",
      visibility: "public",
      themeId: "holi-mehendi",
      thankYouMessage: "You are on the volunteer list. Check your email for shift details.",
      fields: [
        { label: "Full name", labelKey: "name", type: "text", index: "1000", pageIndex: 0, isRequired: true },
        { label: "Phone", labelKey: "phone", type: "phone", index: "2000", pageIndex: 0, isRequired: true },
        { label: "College ID number", labelKey: "student_id", type: "text", index: "3000", pageIndex: 0 },
        {
          label: "Preferred shift",
          labelKey: "shift",
          type: "radio",
          index: "1000",
          pageIndex: 1,
          options: { choices: ["Morning", "Afternoon", "Evening"] },
        },
        {
          label: "Teams (pick any)",
          labelKey: "teams",
          type: "multiselect",
          index: "2000",
          pageIndex: 1,
          options: { choices: ["Security", "Stage", "Food stall", "Cleanup"] },
        },
      ],
      responses: [
        { name: "Aditi K", phone: "+919876543210", student_id: "CS21-044", shift: "Morning", teams: ["Stage", "Food stall"] },
        { name: "Rahul T", phone: "+919812345678", student_id: "EC21-112", shift: "Afternoon", teams: ["Security"] },
        { name: "Sana M", phone: "+919900112233", student_id: "ME21-089", shift: "Evening", teams: ["Cleanup", "Stage"] },
        { name: "Yash P", phone: "+919988776655", student_id: "IT21-201", shift: "Morning", teams: ["Food stall"] },
        { name: "Neha R", phone: "+919911223344", student_id: "CS22-015", shift: "Afternoon", teams: ["Stage", "Cleanup"] },
      ],
    },
    {
      title: "Team Retro (Unlisted)",
      description: "Internal sprint retro. Link only, hidden from explore.",
      slug: "team-retro-unlisted",
      visibility: "unlisted",
      themeId: "minimal-ink",
      thankYouMessage: "Retro notes saved. Keep shipping!",
      fields: [
        { label: "What went well?", labelKey: "went_well", type: "textarea", index: "1000", isRequired: true },
        { label: "What to improve?", labelKey: "improve", type: "textarea", index: "2000" },
        {
          label: "Sprint mood",
          labelKey: "mood",
          type: "select",
          index: "3000",
          options: { choices: ["Energized", "Steady", "Tired but proud"] },
        },
      ],
      responses: [
        { went_well: "Shipped Holi theme presets and glass UI", improve: "More E2E tests on form fill", mood: "Energized" },
        { went_well: "Preview page polish", improve: "Faster seed script for demos", mood: "Steady" },
      ],
    },
    {
      title: "Wedding RSVP (Draft)",
      description: "Draft form for a destination wedding RSVP. Not published yet.",
      slug: "wedding-rsvp-draft",
      visibility: "unlisted",
      status: "draft",
      themeId: "holi-rangoli",
      thankYouMessage: "We cannot wait to celebrate with you!",
      fields: [
        { label: "Guest name", labelKey: "name", type: "text", index: "1000", isRequired: true },
        {
          label: "Attending?",
          labelKey: "attending",
          type: "radio",
          index: "2000",
          options: { choices: ["Joyfully accept", "Regretfully decline"] },
        },
      ],
      responses: [],
    },
  ],
  rangoli_events: [
    {
      title: "Rangoli Workshop Registration",
      description: "Register for our free rangoli and color art workshop.",
      slug: "rangoli-workshop",
      visibility: "public",
      themeId: "holi-rangoli",
      thankYouMessage: "Your spot is reserved. Bring old clothes!",
      fields: [
        { label: "Name", labelKey: "name", type: "text", index: "1000", isRequired: true },
        { label: "Email", labelKey: "email", type: "email", index: "2000", isRequired: true },
        {
          label: "Experience level",
          labelKey: "level",
          type: "select",
          index: "3000",
          options: { choices: ["Beginner", "Intermediate", "Advanced"] },
        },
        {
          label: "Workshop slot",
          labelKey: "slot",
          type: "radio",
          index: "4000",
          options: { choices: ["Sat 10 AM", "Sat 2 PM", "Sun 10 AM"] },
        },
      ],
      responses: [
        { name: "Lakshmi V", email: "lakshmi@example.com", level: "Beginner", slot: "Sat 10 AM" },
        { name: "Manish G", email: "manish@example.com", level: "Intermediate", slot: "Sat 2 PM" },
        { name: "Pooja S", email: "pooja@example.com", level: "Beginner", slot: "Sun 10 AM" },
        { name: "Tarun B", email: "tarun@example.com", level: "Advanced", slot: "Sat 2 PM" },
        { name: "Esha N", email: "esha@example.com", level: "Intermediate", slot: "Sat 10 AM" },
      ],
    },
    {
      title: "Street Holi Safety Checklist",
      description: "Quick checklist before joining public Holi on the street.",
      slug: "street-holi-safety",
      visibility: "public",
      themeId: "holi-baingani",
      thankYouMessage: "Stay safe and have fun!",
      fields: [
        {
          label: "Skin protection applied?",
          labelKey: "skin",
          type: "checkbox",
          index: "1000",
          options: { choices: ["Coconut oil", "Sunscreen", "None yet"] },
        },
        {
          label: "Eye protection?",
          labelKey: "eyes",
          type: "radio",
          index: "2000",
          options: { choices: ["Goggles", "Sunglasses", "Will borrow"] },
        },
        {
          label: "Emergency contact number",
          labelKey: "emergency_phone",
          type: "phone",
          index: "3000",
        },
      ],
      responses: [
        { skin: ["Coconut oil", "Sunscreen"], eyes: "Goggles", emergency_phone: "+919800011122" },
        { skin: ["Sunscreen"], eyes: "Sunglasses", emergency_phone: "+919811122233" },
        { skin: ["Coconut oil"], eyes: "Will borrow", emergency_phone: "+919822233344" },
        { skin: ["Coconut oil", "Sunscreen"], eyes: "Goggles", emergency_phone: "+919833344455" },
      ],
    },
    {
      title: "Corporate Holi Party Menu Vote",
      description: "Vote on snacks and drinks for the office Holi party.",
      slug: "corp-holi-menu-vote",
      visibility: "public",
      themeId: "holi-gulal",
      thankYouMessage: "Votes counted. Menu goes live Friday.",
      fields: [
        { label: "Department", labelKey: "dept", type: "text", index: "1000" },
        {
          label: "Snack preference",
          labelKey: "snack",
          type: "multiselect",
          index: "2000",
          options: { choices: ["Samosa", "Pakora", "Pizza", "Fruit platter", "Chaat"] },
        },
        {
          label: "Drink preference",
          labelKey: "drink",
          type: "select",
          index: "3000",
          options: { choices: ["Thandai", "Juice", "Soft drinks", "Mocktails"] },
        },
        {
          label: "Dietary notes",
          labelKey: "diet",
          type: "textarea",
          index: "4000",
          placeholder: "Veg, vegan, allergies...",
        },
      ],
      responses: [
        { dept: "Engineering", snack: ["Samosa", "Chaat"], drink: "Thandai", diet: "Veg" },
        { dept: "Design", snack: ["Fruit platter", "Pakora"], drink: "Mocktails", diet: "Vegan" },
        { dept: "Sales", snack: ["Pizza", "Samosa"], drink: "Soft drinks" },
        { dept: "HR", snack: ["Chaat", "Fruit platter"], drink: "Juice", diet: "No nuts" },
        { dept: "Support", snack: ["Pakora"], drink: "Thandai" },
        { dept: "Marketing", snack: ["Samosa", "Pizza", "Chaat"], drink: "Mocktails" },
      ],
    },
    {
      title: "Vendor Quote Request (Unlisted)",
      description: "Private form for color powder vendors. Not listed on explore.",
      slug: "vendor-quote-unlisted",
      visibility: "unlisted",
      themeId: "holi-saffron",
      thankYouMessage: "We will review your quote within 48 hours.",
      fields: [
        { label: "Company name", labelKey: "company", type: "text", index: "1000", isRequired: true },
        { label: "Contact email", labelKey: "email", type: "email", index: "2000", isRequired: true },
        { label: "Price per kg (INR)", labelKey: "price", type: "number", index: "3000" },
        { label: "Minimum order (kg)", labelKey: "min_order", type: "number", index: "4000" },
      ],
      responses: [
        { company: "GulalWorks Pvt Ltd", email: "sales@gulalworks.in", price: 120, min_order: 50 },
        { company: "ColorFest Supplies", email: "hello@colorfest.in", price: 95, min_order: 100 },
      ],
    },
  ],
};

async function seedForm(userId: string, spec: SeedForm) {
  const [form] = await db
    .insert(formsTable)
    .values({
      userId,
      title: spec.title,
      description: spec.description,
      slug: spec.slug,
      status: spec.status ?? "published",
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
        description: field.description ?? null,
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

async function seedUser(user: (typeof DEMO_USERS)[number]) {
  const salt = `seed-salt-${user.username}`;
  const passwordHash = hashPassword(user.password, salt);

  const [row] = await db
    .insert(usersTable)
    .values({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      emailVerified: true,
      emailNotificationsEnabled: true,
      salt,
      password: passwordHash,
    })
    .returning({ id: usersTable.id });

  if (!row) {
    throw new Error(`Failed to create user: ${user.email}`);
  }

  return row.id;
}

async function main() {
  console.log("Ensuring theme presets...");
  await ensureFormThemePresets();

  await wipeAllData();

  let totalForms = 0;
  let totalResponses = 0;

  for (const user of DEMO_USERS) {
    const userId = await seedUser(user);
    console.log(`\nCreated user: ${user.email} (@${user.username})`);

    const forms = DEMO_FORMS_BY_USER[user.username] ?? [];
    for (const formSpec of forms) {
      await seedForm(userId, formSpec);
      totalForms += 1;
      totalResponses += formSpec.responses.length;
      console.log(
        `  - [${formSpec.status ?? "published"}] ${formSpec.visibility} "${formSpec.title}" (${formSpec.slug})`,
      );
    }
  }

  console.log("\nSeed complete.");
  console.log(`  Forms: ${totalForms}`);
  console.log(`  Responses: ${totalResponses}`);
  console.log("\nLog in with either account:");
  for (const user of DEMO_USERS) {
    console.log(`  ${user.email} / ${user.password}`);
  }
  console.log("\nTry public forms:");
  console.log(`  /f/holiform_demo/holi-festival-feedback`);
  console.log(`  /f/rangoli_events/rangoli-workshop`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
