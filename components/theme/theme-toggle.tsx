"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Button variant="ghost" type="button" onClick={() => setTheme(nextTheme)}>
      {resolvedTheme === "dark" ? "☼ Light" : "☾ Dark"}
    </Button>
  );
}
