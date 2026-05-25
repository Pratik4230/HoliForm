import { ImageResponse } from "next/og";
import { fetchPublicFormForMetadata } from "~/lib/public-form-metadata";
import { getSiteUrl } from "~/lib/site-url";

export const alt = "Form preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type PageProps = {
  params: Promise<{ username: string; slug: string }>;
};

export default async function OpenGraphImage({ params }: PageProps) {
  const { username, slug } = await params;
  const data = await fetchPublicFormForMetadata(username, slug);

  const title = data?.form.title?.trim() || "Form unavailable";
  const description =
    data?.form.description?.trim().slice(0, 140) ||
    "Fill out this form on HoliForm — no login required.";
  const primary = data?.theme.primaryColor ?? "#db2777";
  const background = data?.theme.backgroundColor ?? "#fdf2f8";
  const text = data?.theme.textColor ?? "#1f2937";
  const accent = data?.theme.accentColor ?? "#06b6d4";
  const siteHost = new URL(getSiteUrl()).host;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: `linear-gradient(145deg, ${background} 0%, ${primary}33 55%, ${accent}44 100%)`,
          color: text,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: primary,
            }}
          />
          <span style={{ fontSize: 28, fontWeight: 600, opacity: 0.85 }}>HoliForm</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.4, opacity: 0.9, maxWidth: 900 }}>
            {description}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, opacity: 0.75 }}>
          <span>@{username}</span>
          <span>{siteHost}</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
