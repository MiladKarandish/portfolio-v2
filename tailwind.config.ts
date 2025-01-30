import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        xs: "625px",
      },
      colors: {
        "50": `var(--bg-50)`,
        "100": `var(--bg-100)`,
        "200": `var(--bg-200)`,
        "300": `var(--bg-300)`,
        "400": `var(--bg-400)`,
        "500": `var(--bg-500)`,
        "600": `var(--bg-600)`,
        "700": `var(--bg-700)`,
        "800": `var(--bg-800)`,
        "900": `var(--bg-900)`,
        "950": `var(--bg-950)`,
      },
    },
  },
  plugins: [],
};
export default config;
