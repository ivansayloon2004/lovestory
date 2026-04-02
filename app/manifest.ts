import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Our Memory Diary",
    short_name: "Memory Diary",
    description: "A private shared memory journal for couples.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fff6fb",
    theme_color: "#f48cb7",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
}
