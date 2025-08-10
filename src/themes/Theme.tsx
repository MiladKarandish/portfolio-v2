"use client";

import Dropdown from "@/common/components/Dropdown";
import { useEffect, useState } from "react";
import * as themes from "@/themes";

const Theme = () => {
  const [theme, setTheme] = useState<string | null>(null);

  const themeOptions = Object.values(themes).map((t) => ({
    label: `${t.label}`,
    value: t.value,
    icon: t.icon,
  }));

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    setTheme(currentTheme || "fox");
  }, []);

  useEffect(() => {
    if (theme) {
      localStorage.setItem("theme", theme);

      const selectedTheme = (themes as any)[theme];
      if (selectedTheme) {
        const root = document.documentElement;

        // Set bg colors
        for (const key in selectedTheme.bg) {
          root.style.setProperty(`--bg-${key}`, `rgba(${selectedTheme.bg[key]})`);
        }
        // Set text colors
        for (const key in selectedTheme.text) {
          root.style.setProperty(`--text-${key}`, `rgba(${selectedTheme.text[key]})`);
        }
        // Set accent colors if available
        if (selectedTheme.accent) {
          for (const key in selectedTheme.accent) {
            root.style.setProperty(`--accent-${key}`, `rgba(${selectedTheme.accent[key]})`);
          }
        }
      }
    }
  }, [theme]);

  return (
    <div className="w-28">
      <Dropdown
        options={themeOptions}
        value={theme}
        onSelect={(value) => setTheme(value)}
        placeholder="Select an option"
      />
    </div>
  );
};

export default Theme;
