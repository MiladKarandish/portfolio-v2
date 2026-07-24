import { ImageResponse } from "next/og";
import { availability, person } from "@/data/profile";

export const alt = `${person.name} — ${person.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The link preview, generated rather than exported from a design tool — it
 * cannot go out of date with the name and title it is showing.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #c15817 0%, #d68858 55%, #a8480f 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, letterSpacing: 6, textTransform: "uppercase", opacity: 0.85 }}>
            {person.role}
          </div>
          <div style={{ fontSize: 96, fontWeight: 700, marginTop: 18, lineHeight: 1.05 }}>{person.name}</div>
          <div style={{ fontSize: 36, marginTop: 24, opacity: 0.9 }}>{person.tagline}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 26,
            opacity: 0.85,
          }}
        >
          <div>{availability.short}</div>
          <div>{person.githubHandle}</div>
        </div>
      </div>
    ),
    size
  );
}
