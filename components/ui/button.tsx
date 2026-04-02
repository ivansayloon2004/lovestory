import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        variant === "primary" && "soft-button",
        variant === "secondary" && "soft-button-secondary",
        variant === "ghost" &&
          "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition hover:bg-white/60 dark:hover:bg-white/10",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}
