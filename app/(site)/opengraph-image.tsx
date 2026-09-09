import { ImageResponse } from "next/og";

export const alt =
  "Miroiterie de la Salanque — Menuisier à Perpignan et dans la Salanque";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#14315b",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            color: "#8fe9dd",
          }}
        >
          30 ANS D&apos;EXPÉRIENCE
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 800,
            marginTop: 18,
          }}
        >
          Miroiterie de la Salanque
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            marginTop: 22,
            color: "#e6ecf3",
          }}
        >
          Menuisier à Perpignan et dans la Salanque
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            marginTop: 40,
            color: "#a9b7c8",
          }}
        >
          Fenêtres · Portails · Clôtures · Pergolas · Vérandas · Volets
        </div>
      </div>
    ),
    { ...size }
  );
}
