import { z } from "zod";

export const formThemeConfigModel = z.object({
  primaryColor: z.string().describe("Primary accent color"),
  backgroundColor: z.string().describe("Page background color"),
  textColor: z.string().describe("Body text color"),
  accentColor: z.string().optional().describe("Secondary accent"),
  fontFamily: z.string().optional().describe("Optional font family stack"),
});

export type FormThemeConfig = z.infer<typeof formThemeConfigModel>;

export const formThemePresetModel = z.object({
  id: z.string().describe("Theme preset id"),
  name: z.string().describe("Display name"),
  category: z.string().describe("Category label for gallery grouping"),
  config: formThemeConfigModel.describe("Theme CSS tokens"),
});

export type FormThemePreset = z.infer<typeof formThemePresetModel>;

export const listFormThemesOutputModel = z
  .array(formThemePresetModel)
  .describe("Available form theme presets");

export type ListFormThemesOutput = z.infer<typeof listFormThemesOutputModel>;

export const listFormThemesInputModel = z.undefined();
