import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 512,
  height: 512
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 22% 18%, #ffd3e5 0%, transparent 30%), radial-gradient(circle at 80% 16%, #d7dcff 0%, transparent 28%), linear-gradient(180deg, #fff6fb 0%, #fff2f8 100%)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%"
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "rgba(255,255,255,0.88)",
            border: "3px solid rgba(255, 158, 194, 0.5)",
            borderRadius: 80,
            boxShadow: "0 25px 80px rgba(149, 106, 167, 0.18)",
            display: "flex",
            flexDirection: "column",
            height: 300,
            justifyContent: "center",
            width: 300
          }}
        >
          <div style={{ color: "#f06698", fontSize: 122, lineHeight: 1 }}>❤</div>
          <div
            style={{
              color: "#4f385f",
              fontFamily: "serif",
              fontSize: 48,
              marginTop: 10
            }}
          >
            Diary
          </div>
        </div>
      </div>
    ),
    size
  );
}
