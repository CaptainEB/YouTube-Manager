"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant="outline"
          onClick={() => setTheme(value)}
          className={cn(theme === value && "border-primary text-primary")}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}
