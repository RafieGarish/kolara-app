"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Switch } from "radix-ui";
import { Icon } from "@/components/icon";
import { notify } from "@/lib/toast";

/** Light is the default; the choice is remembered (localStorage, via next-themes). */
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";

  const onChange = (checked: boolean) => {
    const root = document.documentElement;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("theme-anim");
      window.setTimeout(() => root.classList.remove("theme-anim"), 380);
    }
    setTheme(checked ? "dark" : "light");
    notify(checked ? "Dark mode on" : "Light mode on");
  };

  return (
    <Switch.Root
      className="theme-switch"
      checked={dark}
      onCheckedChange={onChange}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Icon name="sun" className="ts-ico ts-sun" />
      <Icon name="moon" className="ts-ico ts-moon" />
      <Switch.Thumb className="ts-knob" />
    </Switch.Root>
  );
}
