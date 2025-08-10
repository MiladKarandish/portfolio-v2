"use client";

import Dropdown from "@/common/components/Dropdown";
import { useEffect, useState } from "react";

const dynamicImport = (theme: string) => import(`@/themes/${theme}.ts`);

const themes = [
  { label: "fox 🦊", value: "fox" },
  { label: "whale 🐋", value: "whale" },
  { label: "Death", value: "death" },
];

const Theme = () => {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");

    setTheme(currentTheme || "fox");
  }, []);

  useEffect(() => {
    if (theme) {
      localStorage.setItem("theme", theme);

      dynamicImport(theme.split(" ")[0]).then((theme) => {
        const root = document.documentElement;
        for (const key in theme.default.bg) {
          root.style.setProperty(`--bg-${key}`, `rgba(${theme.default.bg[key]})`);
        }
        for (const key in theme.default.text) {
          root.style.setProperty(`--text-${key}`, `rgba(${theme.default.text[key]})`);
        }
      });
    }
  }, [theme]);

  return (
    <div className={`w-28`}>
      <Dropdown options={themes} value={theme} onSelect={(value) => setTheme(value)} placeholder="Select an option" />
    </div>
  );
};

export default Theme;
