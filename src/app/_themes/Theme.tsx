"use client";

import { useEffect, useState } from "react";

const dynamicImport = (theme: string) => import(`@/app/_themes/${theme}.ts`);

const themes = ["fox", "wolf"];

const Theme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "fox");

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme) {
      setTheme(currentTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    dynamicImport(theme).then((theme) => {
      const root = document.documentElement;
      for (const key in theme.default.bg) {
        root.style.setProperty(`--bg-${key}`, `rgba(${theme.default.bg[key]})`);
      }
      for (const key in theme.default.text) {
        root.style.setProperty(`--text-${key}`, `rgba(${theme.default.text[key]})`);
      }
    });
  }, [theme]);

  return (
    <div>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="px-4 py-2 bg-white bg-opacity-20 text-100 rounded-full"
      >
        {themes.map((theme) => (
          <option key={theme} value={theme}>
            {theme}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Theme;
