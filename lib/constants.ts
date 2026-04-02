export const APP_NAME = "Our Memory Diary";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "♡" },
  { href: "/memories", label: "Timeline", icon: "✦" },
  { href: "/calendar", label: "Calendar", icon: "☽" },
  { href: "/gallery", label: "Gallery", icon: "◌" },
  { href: "/letters", label: "Letters", icon: "✉" },
  { href: "/special-moments", label: "Special", icon: "❀" },
  { href: "/settings", label: "Settings", icon: "⚙" }
];

export const SPECIAL_MOMENT_TYPES = [
  { value: "anniversary", label: "Anniversary" },
  { value: "birthday", label: "Birthday" },
  { value: "trip", label: "Trip" },
  { value: "important_event", label: "Important event" }
] as const;

export const MEMORY_BUCKET = "memory-images";
